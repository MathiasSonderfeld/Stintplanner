import { Component, OnInit } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { DrivermanagerComponent } from '../../components/drivermanager/drivermanager.component';

@Component({
  selector: 'app-stintplanner',
  imports: [DrivermanagerComponent, PanelModule],
  templateUrl: './stintplanner.component.html',
  styleUrl: './stintplanner.component.scss'
})
export class StintplannerComponent implements OnInit {



  ngOnInit(): void {
  }

}
