export function vnPhoneNumberValidator(phone: string): boolean {
  const checkLetter = !isNaN(parseFloat(phone)) && isFinite(Number(phone));
  if (!checkLetter) {
    return false;
  }

  const LANDLINE_NUMBER_REGEX =
    /^(^0|\+84|84)+([2])+(([1]((?!7)[0-9])|[2](?!3|4)[0-9]|[3][0-9]|[4](?!4|5)[0-9]|[5](?!0|3)[0-9]|[6][1|2|3|9]|[7](?!8|9)[0-9]|[8](?!4|5|8)[0-9]|[9](?!5|8)[0-9])+([0-9]{7}))$/;
  const MOBILE_NUMBER_REGEX =
    /^(^0|\+84|84)+([3](?!1)[0-9]|[5][2|6|8|9]|[7][0|6|7|8|9]|[8][1-9]|[9](?!5)[0-9])+([0-9]{7})$/;

  return MOBILE_NUMBER_REGEX.test(phone) || LANDLINE_NUMBER_REGEX.test(phone);
}
