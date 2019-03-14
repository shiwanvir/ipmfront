import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';

import { Util } from './util';

interface RemoteConfig {//data structure for remote validation method
  url:string,
  /*formFields:Object,*/
  fieldCode?:string,
  error?:string,
  data?:Object
}


export class PrimaryValidators {

  constructor(private http:HttpClient){ }

  public remote(config:RemoteConfig) : ValidatorFn {
      const validator = (control: AbstractControl): { [key: string]: any } => {
          if (Util.isNotPresent(control)) return undefined;

          let remoteData:{} = (config.data == undefined || config.data == null) ? {} : Object.assign({}, config.data);
          for(var key in remoteData){
            if (typeof remoteData[key] == 'function'){
            //  console.log(control.parent.controls);
              remoteData[key] = remoteData[key](control.parent.controls)

            }
          }
          //debugger
          if(config.fieldCode != undefined)
            remoteData[config.fieldCode] = control.value;

          return new Promise((resolve, reject) => {
                this.http.get(config.url ,{params: remoteData})
                .subscribe(data => {
                    if(data['status'] == 'error'){
                      ///config.formFields[config.fieldCode] = (config.error == undefined) ? data['message'] : config.error;
                      let err = (config.error == undefined) ? data['message'] : config.error;
                      resolve({'remoteValidation': err });
                    }
                    else{
                      resolve(null) ;
                    }
                });
                return {remoteValidation: false};
          })
      };
      return validator;
  };


    //check for white space
    public static noWhitespace(control: AbstractControl): { [key: string]: boolean } {
        if (Util.isNotPresent(control)) return undefined;
        let pattern = '\\s';
        if (new RegExp(pattern).test(control.value)) {
            return { 'noWhitespaceRequired': true };
        }
        return undefined;
    };

    //only allow for charactors and numbers
    public static noSpecialCharactor(control: AbstractControl): { [key: string]: boolean } {
        if (Util.isNotPresent(control)) return undefined;
        let pattern = /[^\w\s-]/gi;
        if (new RegExp(pattern).test(control.value)) {
            return { 'noSpecialCharactor': true };
        }
        return undefined;
    };


    //check is a valid currency
    public static isCurrency(control: AbstractControl): { [key: string]: boolean } {
        if (Util.isNotPresent(control)) return undefined;
        let pattern = /(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?(\.[0-9]{1,4})?$/;
        if (!new RegExp(pattern).test(control.value)) {
            return { 'isCurrency': true };
        }
        return undefined;
    };


    //check empty field
    public static noEmptyString(control: AbstractControl): { [key: string]: boolean } {
        if (Util.isNotPresent(control)) return undefined;
        if (control.value.trim().length === 0) {
            return { 'noEmptyString': true };
        }
        return undefined;
    };

    //check is a number. work for integer and decimals
    public static isNumber(control: AbstractControl): { [key: string]: boolean } {
        if (Util.isNotPresent(control)) return undefined;
        if (isNaN(control.value)) {
            return { 'numberRequired': true };
        }
        return undefined;
    };

    //check value is in a range
    public static isInRange(minValue: number, maxValue: number): ValidatorFn {
        const validator = (control: AbstractControl): { [key: string]: any } => {
            if (Util.isNotPresent(control)) return undefined;
            if (isNaN(control.value)) {
                return { 'numberRequired': true };
            }
            if (+control.value < minValue) {
                return { 'rangeValueToSmall': { 'requiredMinValue': minValue, 'requiredMaxValue': maxValue, 'actual': control.value } };
            }

            if (+control.value > maxValue) {
                return { 'rangeValueToBig': { 'requiredMinValue': minValue, 'requiredMaxValue': maxValue, 'actual': control.value } };
            } else {
                return undefined;
            }
        };
        return validator;
    };

    public static minLength(minLength: number) {
        const validator = (control: AbstractControl): { [key: string]: any } => {
            if (Util.isNotPresent(control)) return undefined;
            let value: string = control.value;
            if (value.length >= minLength) {
                return undefined;
            }
            return { 'minLength': { 'requiredMinLength': minLength, 'actualLength': value.length } };
        };
        return validator;
    };

    public static maxLength(maxLength: number) {
        const validator = (control: AbstractControl): { [key: string]: any } => {
            if (Util.isNotPresent(control)) return undefined;
            let value: string = control.value;
            if (maxLength >= value.length) {
                return undefined;
            }
            return { 'maxLength': { 'requiredMaxLength': maxLength, 'actualLength': value.length } };
        };
        return validator;
    };

    public static min(min: number) {
        const validator = (control: AbstractControl): { [key: string]: any } => {
            if (Util.isNotPresent(control)) return undefined;
            let value: string = control.value;
            if (isNaN(control.value)) {
                return { 'numberRequired': true };
            }
            if (+value >= min) {
                return undefined;
            }
            return { 'min': { 'required': min, 'actual': control.value } };
        };
        return validator;
    };

    public static max(max: number) {
        const validator = (control: AbstractControl): { [key: string]: any } => {
            if (Util.isNotPresent(control)) return undefined;
            let value: string = control.value;
            if (isNaN(control.value)) {
                return { 'numberRequired': true };
            }
            if (max >= +value) {
                return undefined;
            }
            return { 'max': { 'required': max, 'actual': control.value } };
        };
        return validator;
    };

}
