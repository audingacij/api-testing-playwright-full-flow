export class LoginDto {
  username: string
  password: string

  private constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  static createLoginWithCorrectData(): LoginDto {
    return new LoginDto(process.env.USER || '', process.env.PASSWORD || '')
  }

  static createCourierLoginData(): LoginDto {
    return new LoginDto(process.env.COURIER_USER || '', process.env.COURIER_PASS || '')
  }
}
