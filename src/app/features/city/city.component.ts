import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/core/services/message.service';
import { TableDataService } from 'src/app/core/services/table-data.service';
import { ValidationMessagesService } from 'src/app/core/services/validation-messages.service';
import { CityService } from 'src/app/domain/city/city.service';
import { City } from 'src/app/domain/city/model/city';
import { GovernorateService } from 'src/app/domain/governorate/governorate.service';
import { Governorate } from 'src/app/domain/governorate/model/governorate';
import { Column } from 'src/app/shared/components/data-grid/column';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {
  displayedColumns: string[] = [];
  displayedColumnFilter:any
  columns: Column[] = [];
  city!: City[];
  size: number = 10;
  page: number = 0;
  totalRows: number = 0;
  totalRowFirst: number = 0;
  form!: FormGroup;
  arabicName!: FormControl;
  englishName!: FormControl;
  enabled!: FormControl;
  governorate!: FormControl;
  submitted: boolean = false;
  searchForm!: FormGroup;
  cityArabicName!: FormControl;
  cityGovernorate!: FormControl;
  governorates!: Governorate[];
  constructor(
    private tableDataService: TableDataService,
    private formBuilder: FormBuilder,
    private message: MessageService,
    private validationMessagesService: ValidationMessagesService,
    private cityRepository: CityService,
    private governorateRepository: GovernorateService,
    private router: Router
  ) {}

  ngOnInit(): void {
  
    this.initForm();
    this.getGovernorate();
    this.tableDataService.getCity();
    this.columns = this.tableDataService.tableColumns;
    this.displayedColumns = this.tableDataService.displayColumns;
  }

 

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [''],
      version: [0],
      arabicName: ['', [Validators.required, Validators.maxLength(50)]],
      englishName: [null, [Validators.maxLength(50)]],
      governorate: [null, Validators.required],
      enabled: [false, Validators.required]
    });
    this.arabicName = this.form.controls.arabicName as FormControl;
    this.englishName = this.form.controls.englishName as FormControl;
    this.enabled = this.form.controls.enabled as FormControl;
    this.governorate = this.form.controls.governorate as FormControl;
    this.getCity();

  }

  getGovernorate(): void {
    this.governorateRepository.getList({ size: this.size, page: this.page }).subscribe(res => {
      if (res.pagination.itemCount > 0) {
      this.getAllGovernorate(res.pagination.itemCount)
      }
    });
  }

  getAllGovernorate(totalRow: number): void {
    this.governorateRepository.getList({ page: 0, size: totalRow }).subscribe(res => {
      this.governorates = res.data;
      this.totalRows = res.pagination.itemCount;
    });
  }

  getCity(): void {
    this.cityRepository.getList({  page: this.page, size: this.size }).subscribe(res => {
      this.city = res.data;
      this.totalRowFirst = res.pagination.itemCount;
    });
  }

  save(): void {
    if (!this.form.controls['enabled'].valid) {
      this.form.controls['enabled'].setValue(false);
    }
    if (this.form.valid) {
      this.submitted = true;
      this.form.controls['id'].value ? this.update() : this.add();
    } else {
      this.validationMessagesService.validateAllFormFields(this.form);
    }
  }

  add(): void {
    this.cityRepository.add(this.form.value).subscribe(
      _ => {
        this.message.successMessage('تم إنشاء  المدينة بنجاح');
        this.getCity();
        this.clearForm();
        this.submitted = false;
      },
      error => {
        this.submitted = false;
      }
    );
  }

  update(): void {
    this.cityRepository.update(this.form.value).subscribe(
      _ => {
        this.message.successMessage('تم تعديل  المدينة بنجاح');
        this.getCity();
        this.clearForm();
        this.submitted = false;
      },
      error => {
        this.submitted = false;
      }
    );
  }

  pageChanged(event: PageEvent): void {
    this.size = event.pageSize;
    this.page = event.pageIndex;
    this.getCity();
  }

  fetch(city: City): void {
    this.clearForm();
    this.form.patchValue(city);
  }

  delete(id: number): void {
    this.message
      .deleteConfirmation('هل انت متأكد من حذف بيانات  المدينة ؟', 'هذا الإجراء لا يمكن التراجع عنه')
      .subscribe(res => {
        if (res)
          this.cityRepository.delete(id).subscribe(_ => {
            this.message.successMessage('تم حذف بيانات  المدينة بنجاح');
            this.getCity();
          });
      });
  }

  clearForm(): void {
    this.form.reset();
  }

  navigate(id: number): void {
    this.router.navigate([`dashboard/city`, id]);
  }


 


}
