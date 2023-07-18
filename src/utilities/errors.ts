class ErrorBase extends Error {
  name: string;
  message: string;
  helper?: string;

  constructor(
    name: string,
    {message, helper}: {message: string; helper?: string}
  ) {
    super();
    this.name = name;
    this.message = message;
    this.helper = helper;
    this.stack = undefined;
  }
}

export class HollowDBError extends ErrorBase {
  constructor({message, helper}: {message: string; helper?: string}) {
    super('HollowDBError', {message, helper});
  }
}
export class AuthError extends ErrorBase {
  constructor({message, helper}: {message: string; helper?: string}) {
    super('AuthError', {message, helper});
  }
}
