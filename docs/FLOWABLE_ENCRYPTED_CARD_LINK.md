# Encrypted ID-card links from Flowable

The `/card` page accepts a bearer link in this format:

```text
https://id-generating-service.vercel.app/card?data=<iv-and-ciphertext>#key=<aes-key>
```

`data` contains a 12-byte AES-GCM IV followed by the ciphertext and authentication tag. Both values use URL-safe Base64 without padding. The key is placed after `#`, so browsers do not send it to the web server. Decryption and PDF generation happen in the recipient's browser.

## Paste-ready Flowable script task

This version targets Flowable's JavaScript script task on a JVM and uses Java's built-in cryptography. It requires no npm or third-party encryption library.

```xml
<scriptTask id="buildEncryptedIdCardLink"
            name="Build encrypted ID card link"
            scriptFormat="javascript"
            flowable:autoStoreVariables="false">
  <script><![CDATA[
var Cipher = Java.type('javax.crypto.Cipher');
var KeyGenerator = Java.type('javax.crypto.KeyGenerator');
var GCMParameterSpec = Java.type('javax.crypto.spec.GCMParameterSpec');
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

var keyGenerator = KeyGenerator.getInstance('AES');
keyGenerator.init(256);
var secretKey = keyGenerator.generateKey();

var iv = new ByteArray(12);
new SecureRandom().nextBytes(iv);

var cipher = Cipher.getInstance('AES/GCM/NoPadding');
cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(128, iv));
var plaintext = new JString(JSON.stringify(cardData)).getBytes('UTF-8');
var ciphertext = cipher.doFinal(plaintext);

var combined = new ByteArray(iv.length + ciphertext.length);
System.arraycopy(iv, 0, combined, 0, iv.length);
System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);

var appUrl = value('idCardAppUrl', 'https://id-generating-service.vercel.app');
var encryptedIdCardUrl = appUrl + '/card?data=' + base64Url(combined) +
  '#key=' + base64Url(secretKey.getEncoded());

execution.setVariable('idNumber', idNumber);
execution.setVariable('encryptedIdCardUrl', encryptedIdCardUrl);
  ]]></script>
</scriptTask>
```

Configure the following message/service task to send `${encryptedIdCardUrl}`.

## Important security boundary

The full URL is a bearer credential. Anyone who receives it can decrypt the card, because the URL contains both the encrypted data and its random key. This protects personal fields from appearing as readable query parameters and keeps the key out of ordinary HTTP access logs, but it does not replace recipient authentication, expiration, revocation, or one-time access controls.

Avoid placing the complete destination URL directly inside a URL-shortener request: `#key=...` is an HTTP fragment and may be separated before the shortener sees it. If a short URL is required, shorten only the part before `#key=...`, then append the original key fragment to the returned short URL.
