import { ERRORS } from "@utils/error";
import {SMS_PASSWORD, SMS_SENDER_ID, SMS_USER} from '@utils/contants';

export default class SMSRepository {
  async sendOTP(phoneNumber: string): Promise<number> {
    const otp = Math.floor(10000 + Math.random() * 90000);
    const message = `Your OTP for Quality clinic registration is ${otp}  رقم التسجيل الخاص بك في عيادة الجودة OTP هو ${otp}`;
    const url = `https://mshastra.com/sendurl.aspx?user=${SMS_USER}&pwd=${SMS_PASSWORD}&senderid=${SMS_SENDER_ID}&mobileno=${phoneNumber}&msgtext=${message}&priority=High&CountryCode=ALL`
    const response = await fetch(url);
    if (!response.ok) {
      throw ERRORS.SMS_SENDING_FAILED;
    }
    return otp
  }
}