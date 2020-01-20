import {Document} from "mongoose";

export interface IProfileInfo {
    first_name: String,
    last_name: String,
    phone: String,
    verticals: [String],
    university: String,
    level_of_study: String,
    major: String,
    q1: String,
    q2: String,
    q3: String,
    q_slack: String
}

export interface IApplication extends Document {
  "forms": { // can only be modified by user/editors
      "profile_info": IProfileInfo,
      // we can conceivably add additional forms here.
  }
  "id": String,
  "created_profile: string, // only editable by admin (or this user, to a limited extent).
  "valid_slack": string,
}