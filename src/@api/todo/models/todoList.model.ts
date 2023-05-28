import { Todo } from './todo.model.js'
export class TodoList {
  public todos: Todo[] = []
  seeds () {
    const firstItem = new Todo('first item', false, 1)
    const secondItem = new Todo('second item', false, 2)
    const thirdItem = new Todo('third item', false, 3)
    this.todos = [firstItem, secondItem, thirdItem]
    return this.todos
  }
}
