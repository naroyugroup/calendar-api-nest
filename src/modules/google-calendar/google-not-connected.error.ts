export class GoogleNotConnectedError extends Error {
	constructor(message: string) {
		super(message);

		this.name = GoogleNotConnectedError.name;

		Object.setPrototypeOf(this, GoogleNotConnectedError.prototype);
	}
}
