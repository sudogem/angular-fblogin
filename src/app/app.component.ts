import { Component, OnInit } from '@angular/core';
import { FacebookService, InitParams,LoginResponse, LoginOptions} from 'ngx-facebook';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular Login Page';
  data:any;
  ap: any;
  token:any;
  email:any;
  name:any;
  fname:any;
  lname:any;
  gender:any;
  total_friends:any;
  pages_show_list:any;
  listOfMembers:any;
  allMembers:any;
  getdeatil:boolean;
  found:boolean;
  offset: number;
  after: any;
  before: any;
  prev: any;
  next: any;
  position: any;

  constructor(private fb: FacebookService) {
    let initParams: InitParams = {
      appId: '152306474861496',
      version: 'v2.9'
    };

    fb.init(initParams);
  }

  ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getdeatil = false;
    this.offset = 0;
  }

   login() {
      const loginOptions: LoginOptions = {
        enable_profile_selector: true,
        return_scopes: true,
        scope: 'public_profile,user_friends,email,pages_show_list'
      };
    this.fb.login(loginOptions)
      .then((res: LoginResponse) => {
        console.log('Logged in', res);
        this.data=res.authResponse.userID
        this.token=res.authResponse.accessToken;

      })
      .catch(this.handleError);
     // this.getLoginStatus();
  }

  private handleError(error) {
    console.error('Error processing action', error);
  }

  getLoginStatus() {
    this.getdeatil = true;
    console.log('data:',this.data);
    console.log('token:',this.token);
    this.ap='/'+this.data+'/friends'+'/?access_token='+this.token;
    console.log(this.ap)
    this.fb.api(this.ap).then((response) => {
      // console.log(response)
      this.total_friends=response.summary.total_count;
    })

    this.fb.api('/me?fields=gender,first_name,last_name,email')
      .then((res: any) => {
        console.log('Got the users profile', res);
        this.gender=res.gender;
        this.email = res.email;
        this.fname = res.first_name;
        this.lname = res.last_name;
        this.name = this. fname + this.lname;
        this.pages_show_list = res.pages_show_list;
      })
      .catch(this.handleError);

    this.fb.api('/me')
      .then((res: any) => {
        // console.log('Got the users profile', res);
        this.gender=res.gender;
        this.email = res.email;
        this.fname = res.first_name;
        this.lname = res.last_name;
      })
      .catch(this.handleError);
    
    this.getGroupMembers(0, 0, "");
    //this.getallGroupMembers();
  }

  getallGroupMembers() {
    const groupId = '177170715745078';
    const q = 'members';
    const url = `/${groupId}/${q}`;
    var limit = 10;
    var params;
    var ctr=0;
    console.log('getallGroupMembers...');
    console.log('next:',this.next);
    this.found = true;
    if (this.next) {
      params = {"pretty":"0", "limit": limit.toString(), "after": this.next};
    } else {
      params = {"pretty":"0", "limit": limit.toString()};  
    }
    console.log('before params:',params);
    while(this.found) {
      this.fb.api(url, 'get', params).then((response) => {
        if (response.data) {
          this.listOfMembers = response.data;
          console.log('ctr:', ctr);
          console.log('data:',response.data);
          this.allMembers.push(response.data);
          if (response.paging && response.paging.cursors.after) {
            this.next = response.paging.cursors.after;
            this.found = true;
          } else {
            this.found = false;
          }
        }
      });
      ctr = ctr + 1;
    }
    console.log('mana....');
    console.log('allMembers n:',this.allMembers.length);
    console.log('allMembers:',this.allMembers);
  }

  getGroupMembers(before, after, position) {
    // /177170715745078/members
    const groupId = '177170715745078';
    const q = 'members';
    const url = `/${groupId}/${q}`;
    var limit = 10;
    var params;
    console.log(' ');
    if (position === "after") {
      console.log("current pos after:",after);
      this.next = this.after;
      this.prev = this.before;
      params = {"pretty":"0", "limit": limit.toString(), "after": this.next};
      this.position = "after";

    } else if (position === "before") {
      console.log("current pos before:",before);
      this.next = this.after;
      params = {"pretty":"0", "limit": limit.toString(), "before": this.prev};
      this.position = "before";
    } else {
      params = {"pretty":"0", "limit": limit.toString()};
      this.position = "";
    }
    
    console.log('before params:',params);
    this.found = false;
    this.fb.api(url, 'get', params).then((response) => {
      if (response.data) {
        this.listOfMembers = response.data;
        this.found = true;
        console.log(' ');
        console.log('response:',response);
        if (response.paging && response.paging.cursors) {
          if (response.paging.cursors.after) {
            this.after = response.paging.cursors.after;
          }
          if (response.paging.cursors.before) {
            this.before = response.paging.cursors.before;
            if (this.position === "") {
              this.prev = this.before;
            }
          }
        }
        // console.log('after params:',params);
        // console.log('response:',response);
        // console.log('members:',this.listOfMembers);
        console.log('after next:',this.after);
        console.log('before prev:',this.before);
      }

    });
  }

  prevPage(before, after) {
    this.getGroupMembers(before, after, "before");
  }

  nextPage(before, after) {
    this.getGroupMembers(before, after, "after");
  }

  logout(){
    this.fb.logout().then((res) => console.log(res
    ));
  }

}
