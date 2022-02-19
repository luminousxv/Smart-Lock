package com.example.smartkey_ver10

import retrofit2.Call
import retrofit2.http.*

interface Retrofit_Interface {

    /*---------------------Post---------------------------*/
    @FormUrlEncoded
    @POST("user/login/")
    fun postLogin(@FieldMap fields: HashMap<String, String>): Call<LoginInfo>

    @FormUrlEncoded
    @POST("user/join/email-verification/")
    fun postUserInfo(@FieldMap fields: HashMap<String, String>): Call<RegisterUserInfo>

    @FormUrlEncoded
    @POST("user/join/join_success/")
    fun postCheckAuth(@Header("Cookie") cookieid: String,
                   @FieldMap fields: HashMap<String, String>): Call<CheckAuth>

    @FormUrlEncoded
    @POST("main/register_key")
    fun postKeyInfo(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<RegiserKeyInfo>

    @FormUrlEncoded
    @POST("main/open_key/")
    fun postOpen(@Header("Cookie") cookieid: String,
                 @FieldMap fields: HashMap<String, String>): Call<P_op_cl>

    @FormUrlEncoded
    @POST("main/close_key/")
    fun postClose(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<P_op_cl>


    /*-----------------------------Get-----------------------*/
    @GET("main/view_keylist/")
    fun GetKeyList(@Header("Cookie") cookieid: String): Call<GetKeyInfo>

    @GET("main/view_keyrecord/")
    fun GetKeyLog(@Header("Cookie") cookieid: String,
                  @Query("serialNum", encoded = true) sernum:String): Call<GetKeyrecord>

}