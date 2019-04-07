export class AppConfig {
  //private url : string = "http://localhost/surfacedev/public/"

  static apiServerUrl():string{
    return "http://localhost/surfacedev/public/"
   //return "http://172.23.1.241/surfacedev/public/"
   //return "http://surface.test/"
  }
  static apiUrl(){
    return "http://localhost/surfacedev/public/api/"
  //return "http://172.23.1.241/surfacedev/public/api/"
  //return "http://surface.test/api/"
  }

  static blkNewTabUrl(){
   return "http://localhost:4200/#/merchandising/bulk-details"
   //return "http://172.23.1.241/#/merchandising/bulk-details"
    //return "http://surface/api/"
  }

  static StayleImage(){
    return "http://surface/assets/styleImage/"
  }

}
