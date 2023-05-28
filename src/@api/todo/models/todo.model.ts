export class Todo {
  constructor (private readonly task: string, private readonly isCompleted: boolean, private readonly id?: number) {
  }

  get toJson () {
    return {
      task: this.task,
      isCompleted: this.isCompleted,
      id: this.id
    }
  }
}
