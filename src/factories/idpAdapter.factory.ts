export default abstract class IdpAdapterFactory {
  constructor (public name: string) {}
  async upsert (id: string, payload: Record<string, any>, expiresIn: number = 0): Promise<void> {

  }

  async find (id: string): Promise<void> {

  }

  async findByUserCode (userCode: string): Promise<void> {}
  async findByUid (uid: string): Promise<void> {}
  async consume (id: string): Promise<void> {}
  async destroy (id: string): Promise<void> {}
  async revokeByGrantId (grantId: string): Promise<void> {}
}
