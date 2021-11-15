const { createCipheriv, randomBytes,createDecipheriv } = require('crypto');
require('dotenv').config();
/// Cipher
// console.log(process.env)
// const message = 'i like turtles';
// const key = Buffer.from(process.env.key)//randomBytes(32);
// const iv = Buffer.from(process.env.iv)//randomBytes(16);
// console.log(key,iv)

/// Encrypt
function encrypt(message,key,iv){
    const cipher = createCipheriv('aes256', key, iv);
    const encryptedMessage = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
    return encryptedMessage;
    }
/// Decrypt
function decrypt(message,key,iv){
const decipher = createDecipheriv('aes256', key, iv);
const decryptedMessage = decipher.update(message, 'hex', 'utf-8') + decipher.final('utf8');
 return decryptedMessage.toString('utf-8');
}
// Decrypt Array
function decryptArray(messages,key,iv){
    var goodArr=[]
    for(var i=0;i<messages.length;++i){
        goodArr.push(decrypt(messages[i],key,iv))
        }
        return goodArr;
}
// console.log(encrypt(message,key,iv))
// console.log(decrypt(encrypt(message,key,iv),key,iv))
// let arr=[encrypt(message,key,iv),encrypt(message+"wow",key,iv),encrypt(message+"sam",key,iv)]
// console.log(decryptArray(arr,key,iv))
module.exports={
    encrypt:encrypt,
    decrypt:decrypt,
    decryptArray:decryptArray,
}