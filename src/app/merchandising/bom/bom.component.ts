import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject, Observable, of, concat} from 'rxjs';
import {map, startWith, debounceTime, distinctUntilChanged, tap, switchMap, catchError} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { Style } from '../models/style.model';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { HotTableModule } from '@handsontable/angular';

import { CostSheets } from '../models/Costing.model';

import * as Handsontable from 'handsontable';
import { ConsoleService } from '@ng-select/ng-select/ng-select/console.service';
import { forEach } from '@angular/router/src/utils/collection';
declare var $:any;

@Component({
  selector: 'app-bom',
  templateUrl: './bom.component.html',
  styleUrls: ['./bom.component.css']
})
export class BomComponent implements OnInit {


tbl_data            = [];
dropdownList        = [];
dropdownSettings    = {};
selectedItemList    = [];
CustomerOrderList   = [];
RatioQtys           = [];
sizeQtys            = [];
hot;

style_code          = -1;
totalOrderQty       = 0;
tableRowCount       = 0;

totMaterialValue    = 0;
totFabricValue      = 0;
totSewAccValue      = 0;
totPacAccValue      = 0;

fabricValPerc       = 0;
stValPerc           = 0;
ptValPerc           = 0;

IsNewBOM = true;

serverUrl = AppConfig.apiServerUrl();

formFields = {
   

}

StyleList$:Observable<Array<any>>//observable to featch source list
StyleListingLoading = false;
StyleListInput$ = new Subject<string>();
selectedStyle:Style

CostSheetList$ : Observable<any[]>
BOMList$: Observable<any[]>
SizeArr$: Observable<any[]>

  constructor(private fb:FormBuilder, private http:HttpClient) { }

  bomForm = this.fb.group({
    //StyleList: [null],
    ctrlCustomer: [null],
    ctrlDivision:[null],
    ctrlSeason:[null],
    ctrlProduct_category:[null],
    ctrlCostListing:[null],
    ctrlStyleDescription:[null],
    ctrlOrderQty:[null],
    ctrlstyleOrderQty:[null],
    ctrlSMV:[null],
    ctrlBOMListing:[null],
    ctrlFabric:0,
    ctrlSewTrims:0,
    ctrlPackTrims:0,
  })

  ngOnInit() {

    var container = document.getElementById('gridItemList');

    this.hot = new Handsontable(container, {
        data:this.tbl_data,    
        columns:[{
            data:'edit',renderer: 'html',
            readOnly:true,
            className:'htCenter'
        },  
        {
            data:'item',
            className:'htLeft'
        },
        {
            data:'articalno',
            className:'htLeft'
        },
        {
            data:'color',
            className:'htLeft'
        },
        {
            data:'size',
            className:'htLeft'
        },
        {
            data:'uom',
            className:'htCenter'
        },
        {
            data:'conpc',
            className:'htRight'
        },
        {
            data:'wastage',
            className:'htRight'
        },
        {
            data:'unitprice',
            className:'htRight'
        },        
        {
            data:'totqty',
            className:'htRight'
        },
        {
            data:'totvalue',
            className:'htRight'
        },  
        {
            data:'colorway',
            className:'htRight'
        },  
        {
            data:'cuttingdirections',
            className:'htRight'
        }, 
        {
            data:'moq',
            className:'htRight'
        },     
        {
            data:'mcq',
            className:'htRight'
        }, 
        {
            data:'supplier',
            className:'htLeft'
        }   
        ],
        rowHeaders: false,
        colHeaders: ["#", "Item Description", "Artical No", "Color", "Size", "UOM", "Con/Pc", "Wastage","Unit Price", "Total Qty", "Total Value","Color Way","Cutting Directions","MOQ","MCQ","Supplier"],
        colWidths:[30,320,80,80,80,50,60,60,70,70,70,90,90,50,50,200],
        minRows:0,
        minSpareRows: 0,
        contextMenu: true
        

    });

    this.dropdownSettings = {
        itemsShowLimit:3,
        idField: 'order_id',
        textField: 'order_code',
        maxHeight:120,
        enableCheckAll:false
    };
   

    this.LoadStyles();
    
  }

  LoadStyles(){
    
    this.StyleList$ = concat(
        of([]), // default items
        this.StyleListInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.StyleListingLoading = true),
            /*switchMap(term => this.http.get<Style[]>(this.serverUrl + 'api/loadstyles',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.StyleListingLoading = false)
            ))*/
            switchMap(term => this.http.get<Style[]>(this.serverUrl + 'api/merchandising/get-style',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.StyleListingLoading = false)
            ))
        )
    );   
  }

  onListCostings($event){

    this.style_code = $event.style_id;

    this.http.get(this.serverUrl + 'api/loadStyleDetails', {params:{'style_id':$event.style_id}})
    .subscribe(data => {

      
        this.bomForm.setValue({
            ctrlProduct_category:data[0]['prod_cat_description'],  
            ctrlCustomer:data[0]['customer_name'],  
            ctrlDivision:data[0]['division_description'],
            ctrlStyleDescription:data[0]['style_description'],
            ctrlSeason:"",
            ctrlCostListing:"",
            ctrlOrderQty:0,
            ctrlstyleOrderQty:[null],
            ctrlSMV:[null],
            ctrlBOMListing:[null], 
            ctrlFabric:0,
            ctrlSewTrims:0,
            ctrlPackTrims:0,
            
        })
       
        this.CostSheetList$ = this.http.get<CostSheets[]>(this.serverUrl + 'api/merchandising/bulk-cost-listing',{params:{'type':'getCostListing','style_id':$event.style_id}}).pipe(map(res=>res));
        
    })
  }

  getCostingDetails($costingId){

// Get season details
   this.http.get<any[]>(this.serverUrl + 'api/merchandising/bulk-cost-header',{params:{'type':'getCostingHeader','costing_id':$costingId}}).subscribe(data=>{

        this.bomForm.patchValue({
            ctrlSeason:data[0]['season_name'], 
        })

    });

    // Get Sales Order list 
    this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/custorders',{params:{'costingId':$costingId}}).subscribe(data=>{
       
        for(var i=0;i<data.length;i++){
            
            this.CustomerOrderList.push({"order_id":data[i]['order_id'], "order_code":data[i]["order_code"]});
        }
        //console.log(this.CustomerOrderList);
        this.dropdownList = this.CustomerOrderList;
    });

    this.LoadBOMIds();
   
  }

  LoadBOMIds(){

    let $costingId = $("#costing_listing").val();

    // Listing BOMS created against to costings
    this.BOMList$ = this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/bomlist',{params:{'costing_id':$costingId}}).pipe(map(res=>res));


  }

  async onItemSelect(item:any){

    var orderId = item["order_id"];

    let orderQty:number = Number($("#order_qty").val());
    
    this.selectedItemList.push({"orderID":orderId});

    const data = await this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/custorderQty',{params:{'orderId':orderId}}).toPromise();

    this.bomForm.patchValue({           
        ctrlOrderQty:Number(data[0]["Order_Qty"]) + orderQty ,
            
    })   
  }

  async onDeSelect(item:any){

    var orderId = item["order_id"];

    let orderQty:number = Number($("#order_qty").val());
    this.selectedItemList.push({"orderID":orderId});

    const data = await this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/custorderQty',{params:{'orderId':orderId}}).toPromise();

    this.bomForm.patchValue({           
        ctrlOrderQty: orderQty - Number(data[0]["Order_Qty"]),
    })
 }

  generateBOM(){

    this.RatioQtys          = [];
    this.tableRowCount      = 0;   

    this.totMaterialValue   = 0;
    this.totFabricValue     = 0;

    while(this.tbl_data.length > 0){
        this.tbl_data.pop();
    }
    this.hot.render();
    
    var costingId = $("#costing_listing").val();

    if(costingId == null){
        AppAlert.showWarning({title:"Please select required costing from the list"});
        return;
    }

    if(this.selectedItemList.length == 0){
        AppAlert.showWarning({title:"Please select required sales orders from the list"});
        return;
    }

    let totalorderQty:number = Number($("#order_qty").val());
   
    //Get raw material details allocated to costing
    //==============================================
    this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/rmdetails',{params:{'costingId':costingId}}).subscribe(async data=>{

        for(let dataLen = 0; dataLen<data.length; dataLen++){

            //Clear ratio quantity array
            while(this.RatioQtys.length > 0){
                this.RatioQtys.pop();
            }

            let itemCode                = data[dataLen]["master_id"];
            let itemDescription         = data[dataLen]["master_description"];
            let conPc:number            = Number(data[dataLen]["gross_consumption"]);
            let articalNo               = data[dataLen]["article_no"];
            let itemColor               = data[dataLen]["color_name"];
            let itemSize                = data[dataLen]["size_name"];
            let itemUOM                 = data[dataLen]["uom_description"];
            let itemWastage:number      = Number(data[dataLen]["wastage"]);
            let itemUnitPrice:number    = Number(data[dataLen]["unit_price"]);  
            let colorId                 = data[dataLen]["color_id"];
            let uomId                   = data[dataLen]["uom_id"];      
            let moq                     = data[dataLen]["moq"];
            let mcq                     = data[dataLen]["mcq"];
            let isCalDeliveryWise:number = Number(data[dataLen]["calculate_by_deliverywise"]);
            let orderType:number        = Number(data[dataLen]["order_type"]);
            let orderqty                = 0;
            let size_id                 = data[dataLen]["size_id"];
            let supplier_name           = data[dataLen]["supplier_name"];
            let supplier_id             = data[dataLen]["supplier_id"];
            let main_category_code      = data[dataLen]["category_code"]; 
            let color_way               = data[dataLen]["color_option"];
            let cut_direction           = data[dataLen]["cut_dir_description"]; 

            
            //Whether requirement calculate based on customer order color and size ratio
            if(isCalDeliveryWise == 1){
                
                for(var SOCount = 0; SOCount<this.selectedItemList.length; SOCount++){                   
                    
                   let order_id = this.selectedItemList[SOCount]["orderID"];                   

                   switch(orderType){

                    case 1:// Retrieve order colors
                        const tempColors = await this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/colorwise',{params:{'orderId':order_id}}).toPromise();

                        for(let l=0;l<tempColors.length;l++){        
                            if(tempColors[l]["color_name"]!='N/A'){
                                this.RatioQtys.push({"colorname":tempColors[l]["color_name"],"colorqty":tempColors[l]["ColorQty"],"colorid":tempColors[l]["color_id"]});
                            }
                        }

                    break;

                    case 2: // Retrieve order sizes                        
                        const temp = await this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/sizewise',{params:{'orderId':order_id}}).toPromise();
                    
                        for(let l=0;l<temp.length;l++){        
                            if(temp[l]["size_name"]!='N/A'){
                                this.RatioQtys.push({"sizeratio":temp[l]["size_name"],"sizeqty":temp[l]["SizeQty"],"sizeid":temp[l]["size_id"]});
                            }
                        }
                       
                    break;

                    case 3: // Retrieve order color & size

                    break;

                    }
                }

                var res = [];

                switch(orderType){

                    case 1:

                       itemSize = "N/A"
                       size_id = 1;

                        //Group array by color wise                                  
                        this.RatioQtys.reduce(function(r,a){           
                            if(!r[a.colorname]){
                                r[a.colorname] = {colorname:a.colorname, colorqty:0,colorid:a.colorid};                              
                                res.push(r[a.colorname]);  
                            }
                            r[a.colorname].colorqty += Number(a.colorqty);  
                            return r;
                            
                        },{});  

                        for(let x=0;x<res.length;x++){

                            itemColor = res[x]["colorname"];
                            orderqty = Number(res[x]["colorqty"]);
                            colorId =  res[x]["colorid"];
            
                            this.itemsAddToGrid(itemDescription, conPc, articalNo, itemColor, itemSize, itemUOM, itemWastage, itemUnitPrice, itemCode, colorId, uomId, moq, mcq,orderqty, size_id, supplier_name, supplier_id, main_category_code,color_way,cut_direction);
                        }

                    break;

                    case 2:

                        itemColor = "N/A"
                        colorId = 1;
                        //Group array by size wise                                  
                        this.RatioQtys.reduce(function(r,a){           
                            if(!r[a.sizeratio]){
                                r[a.sizeratio] = {sizeratio:a.sizeratio, sizeqty:0,sizeid:a.sizeid};                              
                                res.push(r[a.sizeratio]);  
                            }
                            r[a.sizeratio].sizeqty += Number(a.sizeqty);  
                            return r;
                            
                        },{}); 
                       
                        for(let x=0;x<res.length;x++){

                            itemSize = res[x]["sizeratio"];
                            orderqty = Number(res[x]["sizeqty"]);
                            size_id =  res[x]["sizeid"];
            
                            this.itemsAddToGrid(itemDescription, conPc, articalNo, itemColor, itemSize, itemUOM, itemWastage, itemUnitPrice, itemCode, colorId, uomId, moq, mcq,orderqty, size_id, supplier_name, supplier_id, main_category_code,color_way,cut_direction);
                        }
                       
                    break;

                    case 3:

                    break;

                    }
            }else{

                this.itemsAddToGrid(itemDescription, conPc, articalNo, itemColor, itemSize, itemUOM, itemWastage, itemUnitPrice, itemCode, colorId, uomId, moq, mcq, totalorderQty, size_id, supplier_name, supplier_id, main_category_code,color_way,cut_direction);

            }
        }
        
    }); 

  }

 
 // Add Items to the grid
  itemsAddToGrid(itemdescription, conpc, articalno, itemcolor, itemsize, itemuom, itemwastage, itemunitprice, itemcode, colorid, uomid, moq, mcq, orderqty, sizeid, suppliername, supplierid, maincategorycode, colorway, cutdirection){
   
    this.tableRowCount += 1;

   

    let totalRequiredQty = orderqty * conpc;
    let totalValue = totalRequiredQty * itemunitprice;

    this.totMaterialValue += totalValue;

    switch(maincategorycode){
        
        case "FA":
            let fabValue = totalRequiredQty * itemunitprice;
            this.totFabricValue += fabValue;
            
        break;

        case "ST":
            let stValue = totalRequiredQty * itemunitprice;
            this.totSewAccValue += stValue;
        break;
            
        
        case "PT":
            let ptValue = totalRequiredQty * itemunitprice;
            this.totPacAccValue += ptValue;
        break;

    }

    this.tbl_data.push({"edit":'<img src="" id='+itemcode+'_'+colorid+'_'+uomid+'_'+sizeid+'_'+supplierid+'/>'+this.tableRowCount,"item":itemdescription,"articalno":articalno,"color":itemcolor,"size":itemsize,"uom":itemuom,"conpc":conpc,"wastage":itemwastage,"unitprice":itemunitprice,"totqty":totalRequiredQty.toFixed(),"totvalue":totalValue.toFixed(),"colorway":colorway,"cuttingdirections":cutdirection,"moq":moq,"mcq":mcq,"supplier":suppliername});

    for(var datalen = 0; datalen<this.tbl_data.length;datalen++){

        this.hot.getData().push(this.tbl_data[datalen]);

    }
    this.hot.render();

    this.fabricValPerc  = (this.totFabricValue/this.totMaterialValue)*100;
    this.stValPerc      = (this.totSewAccValue/this.totMaterialValue)*100;
    this.ptValPerc      = (this.totPacAccValue/this.totMaterialValue)*100;

    //alert(this.totMaterialValue);
    this.bomForm.patchValue({
        ctrlFabric:Number(this.fabricValPerc.toFixed(2)),
        ctrlSewTrims:Number(this.stValPerc.toFixed(2)),
        ctrlPackTrims:Number(this.ptValPerc.toFixed(2)),
    })
        
  }

  save_bom(){

    let bomHeader = [];

    var costingId = $("#costing_listing").val();  

    if(this.hot.countRows() == 0){
        AppAlert.showWarning({title:"No lines were generated in BOM"});
        return;
    }

    if(this.IsNewBOM){

        //Initially save bom header
        bomHeader.push({"costingid":costingId});
        this.http.post(this.serverUrl + 'api/merchandising/bom/savebomheader',bomHeader[0]).subscribe(data=>{

        let bom_id = data['bomid']; //Get new BOM ID
        
        //Save SO allocation
         for(var SOCount = 0; SOCount<this.selectedItemList.length; SOCount++){

            let arraySOAllocation = [];
            
            arraySOAllocation.push({"costing_id":costingId,"order_id":this.selectedItemList[SOCount]["orderID"],"bom_id":bom_id});

            this.http.post(this.serverUrl + 'api/merchandising/bom/savesoallocation',arraySOAllocation[0]).subscribe(data=>{

                console.log(data["status"]);

            });

        }

       
        // Save BOM Details
        for(var BOMRowCount = 0; BOMRowCount<this.hot.countRows(); BOMRowCount++){

            let itemGridData = [];
            let imgElement = this.hot.getDataAtCell(BOMRowCount,0);
            let imgSplitElement = imgElement.split("=");
            let imgId = imgSplitElement[2].split("/>");
            let imgIdSplit = imgId[0].split("_");
            
            let itemCode = imgIdSplit[0];
            let colorId = imgIdSplit[1];
            let UOMId = imgIdSplit[2];
            let sizeId = imgIdSplit[3];
            let articalNo = this.hot.getDataAtCell(BOMRowCount,2);
            let conPc = this.hot.getDataAtCell(BOMRowCount,6);
            let wastage = this.hot.getDataAtCell(BOMRowCount,7);
            let unitprice = this.hot.getDataAtCell(BOMRowCount,8);
            let totRequiredQty = this.hot.getDataAtCell(BOMRowCount,9);
            let totItemValue = this.hot.getDataAtCell(BOMRowCount,10);

            itemGridData.push({"bomid":bom_id,"itemcode":itemCode,"itemcolor":colorId,"uomid":UOMId,"articalno":articalNo,"conpc":conPc,"wastage":wastage,"unitprice":unitprice, "totreqqty":totRequiredQty,"totvalue":totItemValue,"itemsize":sizeId});
            
            this.http.post(this.serverUrl + 'api/merchandising/bom/savebomdetail', itemGridData[0]).subscribe(data=>{
                
            })
        }

        $("#btnSave").hide();
        this.LoadBOMIds();


      });
        
    }

    
  }

  getBOMDetails(bomId){

    this.IsNewBOM = false;

    let grdRowCount         = 0;
    let totRawMaterialValue = 0;
    let totFabricValue      = 0;
    let totSewingTrimValue  = 0;
    let totPackingTrimValue = 0;

    while(this.tbl_data.length > 0){
        this.tbl_data.pop();
    }

    var costingId = $("#costing_listing").val(); 

    //Get order qty of the bom sales order
    this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/bomorderqty',{params:{'bomId':bomId}}).subscribe(data=>{

        this.bomForm.patchValue({
            ctrlOrderQty:Number(data[0]["Order_Qty"])
        })
    });


    //Load BOM line item details
    this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/bominfolisting',{params:{'bomId':bomId}}).subscribe(data=>{

        for(let tblLen = 0;tblLen<data.length;tblLen++){

            let itemcode                = data[tblLen]["master_id"];
            let colorid                 = data[tblLen]["color_id"];
            let uomid                   = data[tblLen]["uom_id"];
            let itemdescription         = data[tblLen]["master_description"];
            let articalno               = data[tblLen]["artical_no"];
            let itemcolor               = data[tblLen]["color_name"];
            let itemsize                = data[tblLen]["size_name"];
            let itemuom                 = data[tblLen]["uom_description"];
            let conpc                   = data[tblLen]["conpc"];
            let itemwastage             = data[tblLen]["item_wastage"];
            let itemunitprice           = data[tblLen]["unit_price"];
            let totalRequiredQty:number = data[tblLen]["total_qty"];
            let totalValue:number       = Number(data[tblLen]["total_value"]);
            let moq                     = data[tblLen]["moq"];
            let mcq                     = data[tblLen]["mcq"];
            let sizeid                  = data[tblLen]["size_id"];
            let suppliername            = data[tblLen]["supplier_name"];
            let supplierid              = data[tblLen]["supplier_id"];
            let colorway                = data[tblLen]["color_option"];
            let cutDirection            = data[tblLen]["cut_dir_description"];
            let mainCategoryCode        = data[tblLen]["category_code"];

            totRawMaterialValue += totalValue;

            switch(mainCategoryCode){        
                case "FA":
                    totFabricValue += totalValue;

                break;

                case "ST":
                    totSewingTrimValue += totalValue;
                break;

                case "PT":
                    totPackingTrimValue += totalValue;
                break;
            }

            

            grdRowCount+=1;

            this.tbl_data.push({"edit":'<img src="" id='+itemcode+'_'+colorid+'_'+uomid+'_'+sizeid+'_'+supplierid+'/>'+grdRowCount,"item":itemdescription ,"articalno":articalno,"color":itemcolor,"size":itemsize,"uom":itemuom,"conpc":conpc,"wastage":itemwastage,"unitprice":itemunitprice,"totqty":totalRequiredQty.toFixed(),"totvalue":totalValue.toFixed(),"colorway":colorway,"cuttingdirections":cutDirection, "moq":moq, "mcq":mcq,"supplier":suppliername});
        }        
       
        for(var datalen = 0; datalen<this.tbl_data.length;datalen++){

            this.hot.getData().push(this.tbl_data[datalen]);
    
        }
        this.hot.render();

        this.fabricValPerc  = (totFabricValue/totRawMaterialValue)*100;
        this.stValPerc      = (totSewingTrimValue/totRawMaterialValue)*100;
        this.ptValPerc      = (totPackingTrimValue/totRawMaterialValue)*100;

        //alert(this.totMaterialValue);
        this.bomForm.patchValue({
            ctrlFabric:Number(this.fabricValPerc.toFixed(2)),
            ctrlSewTrims:Number(this.stValPerc.toFixed(2)),
            ctrlPackTrims:Number(this.ptValPerc.toFixed(2)),
        })

    });

    this.http.get<any[]>(this.serverUrl + 'api/merchandising/bom/assigncustorders',{params:{'costingId':costingId}}).subscribe(data=>{
        this.dropdownList = [];
        for(var i=0;i<data.length;i++){
            
            this.CustomerOrderList.push({"order_id":data[i]['order_id'], "order_code":data[i]["order_code"]});
        }
      
        this.dropdownList = this.CustomerOrderList;

        //this.dropdownList.re
    });

  } 

}
