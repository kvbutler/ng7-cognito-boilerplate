import { Encoder, enc as Encoders } from "crypto-js";

/**
 * Encoder implementation wrapping crypto-js base64 encoder
 * This class produces a url safe base64 string
 */
export class Base64Url implements Encoder {
    parse(encodedMessage: string): any {
      encodedMessage = encodedMessage.replace('-', '+');
      encodedMessage = encodedMessage.replace('_', '/');
      // Add padding
      const modLen = encodedMessage.length % 4;
      if (modLen === 1) {
        throw new Error('Invalid base64 string provided');
      } else if (modLen === 2) {
        encodedMessage += '==';
      } else if (modLen === 3) {
        encodedMessage += '=';
      }
      return Encoders.Base64.parse(encodedMessage);
    }
    stringify(words: any): string {
      let base64Encoding = Encoders.Base64.stringify(words);
      base64Encoding = base64Encoding.split('=')[0]; // Remove padding
      base64Encoding = base64Encoding.replace(/\+/g, '-');
      base64Encoding = base64Encoding.replace(/\//g, '_');
      return base64Encoding;
    }
  }