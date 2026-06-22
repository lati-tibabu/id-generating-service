# Encrypted ID-card links from Flowable

The `/card` page accepts an encrypted link and a separate password:

```text
https://id-generating-service.vercel.app/card?data=<salt-iv-and-ciphertext>
Password: XXXX-XXXX-XXXX-XXXX
```

`data` contains a 16-byte PBKDF2 salt, a 12-byte AES-GCM IV, and the ciphertext with its authentication tag. It uses URL-safe Base64 without padding. The password is not stored in the URL. The browser derives the AES key from the supplied password using PBKDF2-HMAC-SHA256, then decrypts the card and generates its PDF locally.

## HTTP endpoint

`POST /api/id-card/encrypted-link` accepts the complete card payload:

```json
{
  "name": "Jane Smith",
  "role": "Staff Engineer",
  "orgName": "Hyperion Tech",
  "idNumber": "EMP-2026-0042",
  "email": "jane@example.com",
  "phone": "+251 911 000 000",
  "bloodGroup": "O+",
  "issuedDate": "2026-06-22",
  "expiryDate": "2028-06-22",
  "photoUrl": "https://example.com/jane.jpg",
  "themeColor": "#1E293B",
  "themeTextColor": "#FFFFFF",
  "layout": "horizontal"
}
```

Every field is optional and normalized with the same defaults as PDF generation. Use a hosted `photoUrl` for message links; embedding a Base64 photo can make the resulting URL impractically large.

The endpoint returns HTTP `201`:

```json
{
  "ok": true,
  "encryptedIdCardUrl": "https://id-generating-service.vercel.app/card?data=...",
  "idCardPassword": "K7DM-WQ9P-3HXR-V6AT",
  "idNumber": "EMP-2026-0042",
  "algorithm": "AES-256-GCM",
  "keyDerivation": "PBKDF2-HMAC-SHA256"
}
```

Failures return `ok: false` together with `error` and `details`.

Set `PUBLIC_APP_URL` in production so generated links always use the public deployment origin.

## Flowable HTTP service task

Use the endpoint when the workflow engine can make HTTP calls. The custom `${httpCall}` delegate stores JSON responses as a Java map, so the following script task copies both returned credentials into ordinary process variables:

```xml
<serviceTask id="generateEncryptedCardCredentials"
             name="Generate encrypted ID card credentials"
             flowable:delegateExpression="${httpCall}">
  <extensionElements>
    <flowable:field name="url">
      <flowable:string>https://id-generating-service.vercel.app/api/id-card/encrypted-link</flowable:string>
    </flowable:field>
    <flowable:field name="method"><flowable:string>POST</flowable:string></flowable:field>
    <flowable:field name="contentType"><flowable:string>application/json</flowable:string></flowable:field>
    <flowable:field name="body">
      <flowable:string><![CDATA[
{
  "name": "${firstName} ${lastName}",
  "role": "${role}",
  "orgName": "${orgName}",
  "idNumber": "${idNumber}",
  "email": "${email}",
  "phone": "${phoneNumber}",
  "bloodGroup": "${bloodGroup}",
  "issuedDate": "${issuedDate}",
  "expiryDate": "${expiryDate}",
  "photoUrl": "${photoUrl}",
  "themeColor": "#1E293B",
  "themeTextColor": "#FFFFFF",
  "layout": "horizontal"
}
      ]]></flowable:string>
    </flowable:field>
    <flowable:field name="saveResultAs"><flowable:string>encryptedCardCredentials</flowable:string></flowable:field>
  </extensionElements>
</serviceTask>

<scriptTask id="storeEncryptedCardCredentials"
            name="Store encrypted card credentials"
            scriptFormat="javascript"
            flowable:autoStoreVariables="false">
  <script><![CDATA[
var credentials = execution.getVariable('encryptedCardCredentials');
execution.setVariable('encryptedIdCardUrl', String(credentials.get('encryptedIdCardUrl')));
execution.setVariable('idCardPassword', String(credentials.get('idCardPassword')));
execution.setVariable('idNumber', String(credentials.get('idNumber')));
  ]]></script>
</scriptTask>
```

## No-HTTP Flowable script task

This version targets Flowable's JavaScript script task on a JVM and uses Java's built-in cryptography. It requires no npm or third-party encryption library.

```xml
<scriptTask id="buildEncryptedIdCardLink"
            name="Build encrypted ID card link"
            scriptFormat="javascript"
            flowable:autoStoreVariables="false">
  <script><![CDATA[
var Cipher = Java.type('javax.crypto.Cipher');
var SecretKeyFactory = Java.type('javax.crypto.SecretKeyFactory');
var GCMParameterSpec = Java.type('javax.crypto.spec.GCMParameterSpec');
var PBEKeySpec = Java.type('javax.crypto.spec.PBEKeySpec');
var SecretKeySpec = Java.type('javax.crypto.spec.SecretKeySpec');
var SecureRandom = Java.type('java.security.SecureRandom');
var Base64 = Java.type('java.util.Base64');
var JString = Java.type('java.lang.String');
var UUID = Java.type('java.util.UUID');
var ByteArray = Java.type('byte[]');
var System = Java.type('java.lang.System');

function value(name, fallback) {
  var current = execution.getVariable(name);
  if (current === null || current === undefined || String(current).trim() === '') {
    return fallback || '';
  }
  return String(current);
}

function base64Url(bytes) {
  return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
}

function generatePassword(random) {
  var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var bytes = new ByteArray(16);
  random.nextBytes(bytes);
  var compact = '';
  for (var i = 0; i < bytes.length; i++) {
    compact += alphabet.charAt(bytes[i] & 31);
  }
  return compact.substring(0, 4) + '-' + compact.substring(4, 8) + '-' +
    compact.substring(8, 12) + '-' + compact.substring(12, 16);
}

var idNumber = value('idNumber', 'ID-' + new Date().getFullYear() + '-' +
  String(UUID.randomUUID()).substring(0, 6).toUpperCase());

var cardData = {
  name: value('name', value('firstName', '') + ' ' + value('lastName', '')).trim(),
  role: value('role', 'Card Holder'),
  orgName: value('orgName', value('organization', 'Acme Corporation')),
  idNumber: idNumber,
  email: value('email', ''),
  phone: value('phoneNumber', value('phone', '')),
  bloodGroup: value('bloodGroup', ''),
  issuedDate: value('issuedDate', ''),
  expiryDate: value('expiryDate', ''),
  photoUrl: value('photoUrl', ''),
  themeColor: value('themeColor', '#1E293B'),
  themeTextColor: value('themeTextColor', '#FFFFFF'),
  layout: value('layout', 'horizontal')
};

var random = new SecureRandom();
var idCardPassword = generatePassword(random);
var salt = new ByteArray(16);
var iv = new ByteArray(12);
random.nextBytes(salt);
random.nextBytes(iv);

var keySpec = new PBEKeySpec(new JString(idCardPassword).toCharArray(), salt, 210000, 256);
var keyBytes = SecretKeyFactory.getInstance('PBKDF2WithHmacSHA256')
  .generateSecret(keySpec).getEncoded();
var secretKey = new SecretKeySpec(keyBytes, 'AES');

var cipher = Cipher.getInstance('AES/GCM/NoPadding');
cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(128, iv));
var plaintext = new JString(JSON.stringify(cardData)).getBytes('UTF-8');
var ciphertext = cipher.doFinal(plaintext);

var combined = new ByteArray(salt.length + iv.length + ciphertext.length);
System.arraycopy(salt, 0, combined, 0, salt.length);
System.arraycopy(iv, 0, combined, salt.length, iv.length);
System.arraycopy(ciphertext, 0, combined, salt.length + iv.length, ciphertext.length);

var appUrl = value('idCardAppUrl', 'https://id-generating-service.vercel.app');
var encryptedIdCardUrl = appUrl + '/card?data=' + base64Url(combined);

execution.setVariable('idNumber', idNumber);
execution.setVariable('encryptedIdCardUrl', encryptedIdCardUrl);
execution.setVariable('idCardPassword', idCardPassword);
  ]]></script>
</scriptTask>
```

The script produces two workflow variables:

- `${encryptedIdCardUrl}` — send this as the card link.
- `${idCardPassword}` — send this as the unlock password, preferably through a separate channel.

## Important security boundary

The URL alone cannot decrypt the card. An attacker needs both the URL and its generated password. Sending both in the same message is still convenient for a demo, but it provides much less protection than sending them through separate channels. This design does not provide expiration, revocation, recipient authentication, or one-time access controls because those require trusted backend state.

The encrypted URL can now be passed to a URL shortener because the password is not stored in a fragment. Keep URL encoding in one layer: give the shortener the complete raw `${encryptedIdCardUrl}` and let the HTTP client encode it once.
