import { Task } from '@models/task.class';
import { OgmsBaseComponent } from '@shared';
import { TaskService } from '@services';
import { Component, OnInit, } from '@angular/core';

@Component({
  selector: 'ogms-user-tasks',
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.scss']
})
export class UserTasksComponent extends OgmsBaseComponent implements OnInit {
  get taskList(): Task[] {
    return this.service.taskList;
  }
  results
  result_type="comparison";
  constructor(
    private service:TaskService,
  ) { 
    super();
  }

  ngOnInit() {
  }

}
