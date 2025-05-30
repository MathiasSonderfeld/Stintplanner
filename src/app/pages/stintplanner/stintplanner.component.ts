import { Component, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NGXLogger } from "ngx-logger";
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { LocalStorageServiceService } from './../../services/localstorageservice/LocalStorageService.service';
import { StintcalculatorService } from './../../services/stintcalculator/stintcalculator.service';
import { RacemanagerComponent } from '../../components/racemanager/racemanager.component';
import { DrivermanagerComponent } from '../../components/drivermanager/drivermanager.component';
import { StatsComponent } from "../../components/stats/stats.component";
import { MillisToDurationPipe } from "../../pipes/millisToDuration/millisToDuration.pipe";
import { DriverModel } from '../../models/DriverModel';
import { RaceModel } from '../../models/RaceModel';
import { RacePlanModel } from '../../models/RacePlanModel';

@Component({
  selector: 'app-stintplanner',
  imports: [
    DecimalPipe,
    DatePipe,
    MillisToDurationPipe,
    FormsModule,
    TagModule,
    CardModule,
    PanelModule,
    TableModule,
    SelectModule,
    DrivermanagerComponent,
    RacemanagerComponent,
    StatsComponent
],
  templateUrl: './stintplanner.component.html',
  styleUrl: './stintplanner.component.scss'
})
export class StintplannerComponent implements OnInit {
  private static readonly RACE_STORAGE: string = "Stintplanner_raceModel";
  private static readonly DRIVER_STORAGE: string = "Stintplanner_driverModels";
  private static readonly PLAN_STORAGE: string = "Stintplanner_racePlan";

  drivers: DriverModel[] = [];
  race: RaceModel = new RaceModel();
  racePlan: RacePlanModel | undefined = undefined;
  showTable: boolean = false;
  validState: boolean = false;
  selectedDriver: DriverModel | undefined;

  constructor(
    private logger:NGXLogger,
    private localStorageServiceService:LocalStorageServiceService,
    private stintcalculatorService:StintcalculatorService
  ){}

  ngOnInit(): void {
    var persistedRaceModel = this.localStorageServiceService.get<RaceModel>(StintplannerComponent.RACE_STORAGE);
    if(persistedRaceModel != null){
      this.race = persistedRaceModel;
      this.race.raceStart = new Date(this.race.raceStart!);
    }

    var persistedDriverModels = this.localStorageServiceService.get<DriverModel[]>(StintplannerComponent.DRIVER_STORAGE);
    if(persistedDriverModels != null){
      this.drivers = persistedDriverModels;
    }

    var persistedRaceplan = this.localStorageServiceService.get<RacePlanModel>(StintplannerComponent.PLAN_STORAGE);
    if(persistedRaceplan != null){
      this.racePlan = persistedRaceplan;
      this.showTable = true;
    }
    this.validateInputs();
  }

  persistRace(){
    this.localStorageServiceService.set<RaceModel>(StintplannerComponent.RACE_STORAGE, this.race);
  }
  persistDrivers(){
    this.localStorageServiceService.set<DriverModel[]>(StintplannerComponent.DRIVER_STORAGE, this.drivers);
  }
  persistPlan(){
    if(this.racePlan != undefined){
      this.localStorageServiceService.set<RacePlanModel>(StintplannerComponent.PLAN_STORAGE, this.racePlan!);
    }
  }

  updateDriver(driver: DriverModel, stintCounter: number){
    this.logger.info('changing driver to ' + driver.name + 'for stint ' + stintCounter);
    this.racePlan!.stints[stintCounter].driver = driver;
  }

  calculateStints(){
    this.validateInputs();
    if(this.validState) {
      var driverPerStintList: DriverModel[] = [];
      if(this.racePlan != undefined){
        driverPerStintList = this.racePlan!.stints
        .filter(d => d.driver != undefined && this.drivers.includes(d.driver))
        .map(d => d.driver!);
      }

      this.racePlan = this.stintcalculatorService.calculateStints(this.race, driverPerStintList, this.drivers[0]);
      this.persistPlan();
      this.showTable = true;
    }
  }

  validateInputs() {
    if(this.drivers.length == 0){
      this.logger.info("no drivers found");
      this.validState = false;
      return;
    }
    for(let driver of this.drivers){
      if(!driver.name){
        this.logger.info("driver name invalid");
      this.validState = false;
      return;
      }
      if(!this.validNumber(driver.fuelConsumption)){
        this.logger.info("driver fuelConsumption invalid");
      this.validState = false;
      return;
      }
      if(!this.validNumber(driver.laptimeInMilliseconds)){
        this.logger.info("driver laptimeInMilliseconds invalid");
      this.validState = false;
      return;
      }
    }

    if(!this.race.raceStart){
      this.logger.info("race start invalid");
      this.validState = false;
      return;
    }
    if(!this.validNumber(this.race.raceDurationInMilliseconds)){
      this.logger.info("race raceDurationInMilliseconds invalid");
      this.validState = false;
      return;
    }
    if(!this.validNumber(this.race.fuelTankSizeInLiters)){
      this.logger.info("race fuelTankSize invalid");
      this.validState = false;
      return;
    }
    if(!this.validNumber(this.race.refuelRateInMillisecondsPerLiterRefueled)){
      this.logger.info("race refuelRate invalid");
      this.validState = false;
      return;
    }
    if(!this.validNumber(this.race.driveThroughInMilliseconds)){
      this.logger.info("race driveThrough invalid");
      this.validState = false;
      return;
    }
    this.validState = true;
  }

  private validNumber(input: number | undefined){
    return input != undefined && Number.isFinite(input) && input > 0;
  }

}
