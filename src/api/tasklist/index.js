const tasklist = require("tasklist");

export default class TaskList {
  async getTasksList() {
    return tasklist();
  }
}
