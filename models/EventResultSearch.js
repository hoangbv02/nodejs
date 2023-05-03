"use strict";
class EventResultSearch {
  constructor(title, description) {
    this.title = title;
    this.description = description;
  }

  get message() {
    return this.title + " "+ this.description;
  }


  
}
module.exports = EventResultSearch;
