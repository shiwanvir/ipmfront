import { Component, OnInit, ViewChild, TemplateRef, Directive, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat} from 'rxjs';
import { map } from 'rxjs/operators';

//third party components
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { forEach } from '@angular/router/src/utils/collection';




@Component({
  selector: 'app-itemcreationwizard',
  templateUrl: './itemcreationwizard.component.html',
  styleUrls: [],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ItemcreationwizardComponent implements AfterViewInit {

  //@ViewChild(ModalDirective)composition_modal : ModalDirective;
  //@ViewChild(ModalDirective)content_modal : ModalDirective;

  
  composition_modal:BsModalRef;
  content_modal:BsModalRef;
  propertyValue_modal:BsModalRef;

  itemForm:FormGroup = null  
  contentForm:FormGroup = null
  propertyValueForm:FormGroup = null
  serverURL = AppConfig.apiServerUrl()
  compositionTitle = "New Composition"
  contentTitle = "New Content"
  propertyTitle = "New Property Value"

  mainCategory$ : Observable<any[]>
  subCategory$ : Observable<any[]>
  assignProperties$ : Observable<any[]>
  contentTypeList$ : Observable<any[]>
  compositionsList$ : Observable<any[]>
  propertyValueList$ : Observable<any[]>
  UOMList$ : Observable<any[]>
  rsSubCategory$ : Observable<any[]>
  rsMainCtegory$ : Observable<any[]>

  tempPropertyValue : TemplateRef<any[]>

  propertyId = -1;

  formFields = {
    category_code : '-1',
    sub_category_code : '-1',
    btn_save_property:'',
    btn_add_content:'',
    content_type:'',
    property_value:'',
    uomCtrl : '-1'

  }

  constructor(private fb:FormBuilder, private http:HttpClient, private modalService: BsModalService) {

   }

  
  ngOnInit() {

    this.itemForm = new FormGroup({
      category_code : new FormControl(-1),
      sub_category_code : new FormControl(-1),
      uomCtrl : new FormControl(-1)
    });

    this.contentForm = new FormGroup({
      content_type : new FormControl(null)
    });

    this.propertyValueForm = new FormGroup({ 
      property_value : new FormControl(null)
    });

    
    this.itemForm = this.fb.group({

      category_code : [null, [Validators.required]],      
      sub_category_code : [null, [Validators.required]],
      //property_value : [null,[Validators.required]],
      uomCtrl : [null, [Validators.required]]   
    });

    this.contentForm = this.fb.group({
      content_type : [null, [Validators.required]]
    });

    this.propertyValueForm = this.fb.group({
      property_value : [null, [Validators.required]]
    });
    

    
    $("#trComposition").css('display','none');


    this.loadMainCategoryList();
    this.loadContentList();
    this.loadCompositionsList();
    this.loadUOM();
  }

  ngAfterViewInit(){
   
  }  

  PopUpFabricComposition(template: TemplateRef<any>){    
    this.composition_modal =  this.modalService.show(template,{class:'modal-sm'});
  }

  PopUpContent(template: TemplateRef<any>){
    this.content_modal = this.modalService.show(template, { class: 'second'});
  }

  PopUpAddPropertyValue(property_id, template: TemplateRef<any>){
      
    this.propertyId = property_id;
    this.propertyValue_modal = this.modalService.show(template,{class: 'propertvalue'});
    //$("#propertyValue").dialog();
  }

  loadMainCategoryList(){
    this.mainCategory$ = this.http.get<any[]>(this.serverURL + "finance/item/maincategorylist").pipe(map(res => res));
  }

  loadUOM(){
    this.UOMList$ = this.http.get<any[]>(this.serverURL + "org/uom/list-all").pipe(map(res=>res));
  }

  loadSubCategory(mainCode){
    
    this.clearPropertyTable();
    
    if(mainCode == 1){
      $("#trComposition").fadeIn();
    }else{
      $("#trComposition").fadeOut();
    }
    this.subCategory$ = this.http.get<any[]>(this.serverURL + 'finance/item/get-subcatby-maincat', {params:{'category_id':mainCode}}).pipe(map(subres => subres));    
  }

  clearPropertyTable(){
    $("#tblPropertyValues > tbody > tr").remove();
  }

  loadAssignProperties(subCatCode){    
    this.clearPropertyTable();
    this.assignProperties$ = this.http.get<any[]>(this.serverURL + 'itemproperty/load-assign-properties',{params:{'subcategory_code':subCatCode}})
      .pipe(map(res=>res));
     
    this.assignProperties$.forEach(element => {
     for(var i =0; i<element.length;i++){

        var _propertyId = element[i]["property_id"];
        var _propertyName = element[i]["property_name"];

        var _tr = "<tr style='height:30px; padding: 2px 5px;'><td width='10%'>"+_propertyName+"</td>";
        _tr += "<td width=35%><select class='form-control input-xxs set-select-general' id="+_propertyId+"><option class='space-option'>..........</option></select></td>";
        _tr += "<td width='2%'>&nbsp;</td>";
        _tr += "<td width='5%'><button type='button' class='btn bg-teal-400 btn-labeled btn-primary btn-xs' id=btn_"+_propertyId +"><b><i class='icon-plus3'></i></b>&nbsp;</button></td>";
        _tr += "<td width='2%'>&nbsp;</td>";
        _tr += "<td width='30%'><input type='text' class='form-control input-xxs' /></td>";   
        _tr += "<td width='1%'>&nbsp;</td>";
        _tr += "<td width='15%'><select class='form-control input-xxs set-select-general'><option>AFTER</option><option>BEFORE</option></select></td></tr>";     
        $("#tblPropertyValues tbody").append( _tr); 
        
        /*if(typeof(window.event) != "undefined"){
            document.getElementById('btn_'+_propertyId).addEventListener('click', this.setPropertyId);

        }else{
            
        }*/
        document.getElementById('btn_'+_propertyId).addEventListener('click', this.setPropertyId.bind(this));
        document.getElementById('btn_'+_propertyId).addEventListener('click', function(){ 
                
            $("#propertyValue").fadeIn();

        });
        this.LoadPropertyValues(_propertyId);
     }    
     
    });
    
    
     
  }
  
  setPropertyId(evt){
    
    var _arr_propertyID = evt.currentTarget.id.split("_");
    this.propertyId = _arr_propertyID[1];
    
    $("#hndPropertyId").val(this.propertyId);
  }

  closePropertyValue(){    
    $("#propertyValue").fadeOut();
  }

  saveNewContent(){
    this.http.post(this.serverURL + 'itemCreation/saveContent', this.contentForm.getRawValue())
    .subscribe(data =>{
      if(data['status'] == 'success'){
        AppAlert.showSuccess({text:data['message']});
        this.loadContentList();
        this.itemForm.reset();
      }
      
      if(data['status'] == 'exist'){
        AppAlert.showWarning({title:"Content name already exist"});
        return;
      }
    });
  }
 
  loadContentList(){
    this.contentTypeList$ = this.http.get<any[]>(this.serverURL + 'itemCreation/loadContent').pipe(map(res=>res));
  }

  loadCompositionsList(){
    this.compositionsList$ = this.http.get<any[]>(this.serverURL + 'itemCreation/loadCompositions').pipe(map(comp=>comp));
  }

  LoadPropertyValues(_propertyId){
    //alert(_propertyId);
    this.propertyValueList$ = this.http.get<any[]>(this.serverURL + 'itemCreation/loadPropertyValue',{params:{'property_id':_propertyId}}).pipe(map(res=>res));

    this.propertyValueList$.forEach(element =>{
      for(var i =0; i<element.length;i++){
        var  _AssignValue = element[i]["assign_value"];

        $("#tblPropertyValues > tbody > tr").each(function(){
          var objSelect = $(this).find('td').eq(1).find('select');              
          var objSelectId = $(this).find('td').eq(1).find('select').attr('id');

          if(_propertyId==objSelectId){
            objSelect.append("<option class='space-option'>"+_AssignValue+"</option>");
          }
        });
      }
    });    
  }

  ClearLoadPropertyValues(_propertyId){
    $("#tblPropertyValues > tbody > tr").each(function(){
      var objSelect = $(this).find('td').eq(1).find('select');   
            
      var objSelectId = $(this).find('td').eq(1).find('select').attr('id');

      if(_propertyId==objSelectId){
        objSelect.find('option').remove();
      }
    });
  }


  saveComposition(){

    var totalCompositionVal = 0;
    var compositionDescription = "";
    var arrayCompostionDescription = [];

    // Validate composition value with in 100%
    // ==========================================
    $("#tblComposition > tbody > tr").each(function(){
      var compositionVal = parseInt($(this).find('td').eq(2).find(':text').val());
      totalCompositionVal += compositionVal;
    });

    if(totalCompositionVal != 100){
      AppAlert.showError({text:"Content value must be equal to 100%"});
      return;
    }
    // ==========================================

    $("#tblComposition > tbody > tr").each(function(){

      var contentType = $(this).find('td').eq(1).html();
      var compositionVal = parseInt($(this).find('td').eq(2).find(':text').val());

      if(compositionVal > 0){
        compositionDescription += " " + compositionVal + "% " + contentType;
      }   
    });

    // Save composition to the item_content table
    // =============================================
    arrayCompostionDescription.push({"comp_description":compositionDescription});

    this.http.post(this.serverURL + 'itemCreation/saveComposition',arrayCompostionDescription[0])
      .subscribe(data =>{
        if(data['status'] == 'success'){
          this.loadCompositionsList();
          AppAlert.showSuccess({text:"Successfully Saved "});
        }
      });
  }

  savePropertyValue(){    

    var arrayPropertyValue = [];
    
    var propertyValue = $("#property_value").val(); 
    this.propertyId = $("#hndPropertyId").val();  
    
    arrayPropertyValue.push({"propertyid":this.propertyId, "propertyValue":propertyValue});

    this.http.post(this.serverURL + "itemCreation/savePropertyValue", arrayPropertyValue[0])
      .subscribe(data=>{
        if(data['status'] == 'success'){
          AppAlert.showSuccess({text:"Successfully Saved"});
          $("#property_value").val("");
          this.ClearLoadPropertyValues(this.propertyId);
          this.LoadPropertyValues(this.propertyId);
          this.closePropertyValue();
        }

        if(data['status'] == 'exist'){
            AppAlert.showWarning({title:"Value already exist in given property"});
            return;
        }
      });
   
  }

  saveItem(){

    var Is_Display = -1;
    var _subCatName = '';
    var _fabComposition = '';
    var _itemDescription = '';
    var _mainItemPrefix = '';
    var _subCatPrefix = '';
    var _itemPrefix = '';
    var _arrCompoistion = [];

    var objFormValues =(this.itemForm.getRawValue()); 
    var _subCatCode = objFormValues["sub_category_code"];           
    var _mainCatCode = objFormValues["category_code"]; 
    var _uom_code = objFormValues["uomCtrl"]; 


    // Get details of the main Category
    // ========================================
    this.rsMainCtegory$ = this.http.get<any[]>(this.serverURL + "itemCreation/get-maincat",{params:{'categoryId':_mainCatCode}}).pipe(map(res=>res));
    this.rsMainCtegory$.forEach(mainElements=>{

      _mainItemPrefix = mainElements[0]['category_code'];

      // Get details of the subcategory
      // ===============================
        this.rsSubCategory$ = this.http.get<any[]>(this.serverURL + "finance/item/get",{params:{'subcategory_id':_subCatCode}}).pipe(map(res=>res));

        this.rsSubCategory$.forEach(element=>{
          Is_Display = (element[0]['is_display']);
          _subCatPrefix = element[0]['subcategory_code'];

          _itemPrefix = _mainItemPrefix + "#" + _subCatPrefix + "#";
          
          if(Is_Display == 1){
              _subCatName = $("#sub_category_code option:selected").text();     
          }

          if(_subCatName != ''){
            _itemDescription += _subCatName;
          }
    
          if(_mainCatCode == 1){
            _fabComposition = $("#cmbFabComposition option:selected").text();

            if(_fabComposition != '------ Select Fabric Composition ------'){
              _itemDescription += _fabComposition;
              _arrCompoistion = _fabComposition.split(" ")

              for(var arrlen = 0; arrlen < _arrCompoistion.length; arrlen++){
                if(_arrCompoistion[arrlen].length > 3){
                  _itemPrefix += _arrCompoistion[arrlen].substring(0,3) + "#";
                }else{
                  _itemPrefix += _arrCompoistion[arrlen] + "#";
                }
              }
              
            }
          }
    
          $("#tblPropertyValues > tbody > tr").each(function(){
    
            //var proprtyValue = $(this).find('td').eq(1).find('select').text();
            var _proprtyValue = $(this).children('td:nth-child(2)').find('option:selected').val();
            var _optionalValue = $(this).children('td:nth-child(6)').find(':text').val()
            var _displayOption = $(this).children('td:nth-child(8)').find('option:selected').val();
    
            
            if(_proprtyValue != '..........'){
              _itemPrefix += _proprtyValue.substring(0,3) + "#";
              if(_optionalValue != ""){
                if(_displayOption == "AFTER"){
                  _itemDescription += " " + _proprtyValue + " " + _optionalValue;
                }else{
                  _itemDescription += " " + _optionalValue + " " + _proprtyValue ;
                }
              }else{
                _itemDescription += " " + _proprtyValue;
              }   
            }
    
          });
    
          AppAlert.showConfirm({
            text:_itemDescription
          },
          (result) =>{
            if(result.value){

              var _arrItem = [];

              // ====== Varify Item ===================
              // Varify item exist before save the item
              // ======================================

              this.http.get(this.serverURL + "itemCreation/check-item",{params:{"master_description":_itemDescription}})
              .subscribe(val=>{
                if(val['recordscount']>0){
                  AppAlert.showWarning({title:"Item already exist in the system"});
                }else{

                  // ====== Save Item ================              
                  _arrItem.push({"subcategory_id":_subCatCode, "master_code" : _itemPrefix, "master_description": _itemDescription, "uom_id":_uom_code, "status":1});

                  this.http.post(this.serverURL + "itemCreation/saveItem", _arrItem[0])
                  .subscribe(data=>{
                    if(data['status'] == 'success'){
                      AppAlert.showSuccess({text:"Successfully Saved"});
                    
                    }
                  });
                  // ====== EOF Save Item ================
                }
              });
              // ======= EOF Verify Item ==============
            }
          }
          
          );        
        });

      

    });
  }
  
  
}
