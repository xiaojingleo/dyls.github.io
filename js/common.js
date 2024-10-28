 function get_timestamp() {
    var date = new Date(); //获取当前时间
    return Math.ceil(date.getTime() / 1000).toString();
}

function ajax(options) {
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    var params = formatParams(options.data);

    //创建 - 非IE6 - 第一步
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else { //IE6及其以下版本浏览器
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.responseText, xhr.responseXML);
            } else {
                options.fail && options.fail(status);
            }
        }
    }

    //连接 和 发送 - 第二步
    if (options.type == "GET") {
        xhr.open("GET", options.url + "?" + params, true);
        xhr.send();
    } else if (options.type == "POST") {
        xhr.open("POST", options.url, true);
        //设置表单提交时的内容类型
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
}

//格式化参数
function formatParams(data) {
    var arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    return arr.join("&");
}

function encryptData(data) {
    var encrypted;
    const publicKeyPem = '-----BEGIN PUBLIC KEY-----'
        + 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA02F/kPg5A2NX4qZ5JSns+bjhVMCC6JbTiTKpbgNgiXU+Kkorg6Dj76gS68gB8llhbUKCXjIdygnHPrxVHWfzmzisq9P9awmXBkCk74Skglx2LKHa/mNz9ivg6YzQ5pQFUEWS0DfomGBXVtqvBlOXMCRxp69oWaMsnfjnBV+0J7vHbXzUIkqBLdXSNfM9Ag5qdRDrJC3CqB65EJ3ARWVzZTTcXSdMW9i3qzEZPawPNPe5yPYbMZIoXLcrqvEZnRK1oak67/ihf7iwPJqdc+68ZYEmmdqwunOvRdjq89fQMVelmqcRD9RYe08v+xDxG9Co9z7hcXGTsUquMxkh29uNawIDAQAB'
        + "-----END PUBLIC KEY-----";
    var rsaEncrypt = new JSEncrypt();
    rsaEncrypt.setPublicKey(publicKeyPem);

    encrypted = rsaEncrypt.encrypt(data);

    return encrypted;
}
function AES_CBC_decrypt(data, key = "e6d5de5fcc51f53d", iv = "2f13eef7dfc6c613") { //key,iv：16位的字符串
        // CryptoJS.Base64.encodeBase64(data,CryptoJs.Base64.No_WRAP);
        // Base64.encodeBase64String(data,Base64.NO_WRAP);
        var key1 = CryptoJS.enc.Latin1.parse(key);
        var iv1 = CryptoJS.enc.Latin1.parse(iv);
        var decrypted = CryptoJS.AES.decrypt(data, key1, {
            iv: iv1,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        });
        result = decrypted.toString(CryptoJS.enc.Utf8);
        console.log(result);
        return result;
    }


// var str = "aZmR9OYLTBJiHscJmoiPSQvUon2rl_YSZT6w34HmIcz_Kc5efaCKxCL5R6geSlTlO5MlfEnV2qo24q92WtLLRCM62jqhmK8653iPxkouMMMotkUt8cInPl4tndI6Y4XjwHrH3aVJZ3gn547N458zsWSvh3yhNxDkYh_oLc7U0o0jk2sU0w_KSIKg2iV3Tbg-O7u3b1oEpPbR65ocqWBlGDX3nOdtQLV9_QYq1tr5Ll2kglTejqf2T4tMqr1lM21FzLUYMciuIuJHQNyr5PhWT3jE4kkrsgSxgeyZ4uuPvNlUFlTijqLVf0Sn8TOcHXhKOUdGmCcT5DokJn1Wz5Q3af5o-7cNWjPUT-K3rBQ-o_qhBBITVUuNQ2Zxgs6NTZQhfkS4jPWcrBUQGcRacaBLmO_QwVhbF8pogAIfYnAtF2ARv_Nrurc22DkuTPf5WG9vqZ2hC-p1JqsfJtZhjrGr-XS0yb31N1-8KetombhQi2Dk2iktyYp4apBLnkGUx0sb2gi45Suz5eHwkLhrj96KJGXLMvM51AmKuRvru5IqrbT2_WlyMRjz4HPC8sVs1mVbI2UkAzjbnZzGBmvdxp1j7mZ9dI4ijGB7Y2_bQKuiiLoiWKfaLcUF5vk8jU8pTINA6ECTSLnkWEYEIO_IMc4YFnSRSWeWBhCESZ5gXtMUVQzoIMtKCj9w0f8keg0TOovE4dcM6jgxzs4Om1mNE7BFbCJ38qptqBzJ2wtwzpxQPY7CSftbiXg7Y4d4m1WcSZior67YBP5Mik2y46WgBKrJoqmgLPx63atLx2bT1bemJMV4HJWwMP1YQERVUV8IyZVddEd0C8naYcuIcEuRcgIxdeFP8_N3FySz61lJWNob1PrcUk9xVsWJzkaumOaS4Oldi7LXDb5ILUv3REuP6DlEpOIqAMxXBHagMDU3_GkBKJFwUkM640uCNJYLFNiMTV9BhT_u4aaL32TLVOdth2dQ-SX0L0EyUIaMtOxi1xOmZLeN3r6HATi2Rr6jFYqHQxmih1momTCCWl7NbSX5y0_FHddpfjT7Bjv1XeRuRA6_Km65ZAgkIbmK8wjHocfPbNcJnnS4py0pNc0BmqD5JjVyn7oucF8W0OE89gyMCyq5wP4HEsmFth7Og6SXurf4khs2M6QqnVePHQgzSCMn7X_ObG-tsPIuWIPKIJ2715rSrTR6Qtj7TAWPO4hlvyrIaapXFG8no5cFBlIXihJUqU90MzR-7PGy80Ryc5eG0CdZqrTZju4DMeTZ45DtzY4GrkhNfPj-1vdXk7NcLVXLE3EXyMM1Nm-v06P0PO5Ou1Wpuz_xWU-i2_uocC4ws5fH7WKj6CMR7GFWhF5dz_8yGvQa0_YxXQEMjBJwJ1P8GqJYLmktj1RjkuTzAOtbQFt66B9mYhkB7-bntKAC7RWGJEX1LaXEONo4KE_snEBxMRqw7pNwayxcytdA66rsmUsvAKSkAhiqoiSIRhWeB0xMSS9_28q1Gi7URRNxCsLVNiINwEdCs2AutwcCC2gKhjTnRMrfc18jshJfx9WpXFsiIXWEIQ8e0WDCca65gm8kR2gzjb7TeIwm4aR38lh5QiEjDMGYUzIyQv848NfnJonbz7nzFZaugsFzYVX7XS8agv3mhOPKVLHlcLq4dGDhTto30RJOnGGRyuc_KAQn6wZ3bFyiZafs6pxssfKD62fQqHNKYR20hSyE6jBmLKTKUA_8SFZCAJaNUfymzHCV6J_fZ53Cyk2wPp7F2rAU4x-d1_znnl5vNtPIR3SjZf0HwWkaSZdTzT1pVCTw62Sw6RD_gPATqNK99Um667s8aghjRSWoUDSzxUaq0U4v5PNiG7zx16QFJQEomsPj0_1KX99Owp2z1-3_n49k7ww0dmBVBj0xJKeSKD0VqmvmZnEhwoewfUi0xFTOnn5Bxp2lfVAMgvuXqTZXrvzbzGqw1M0FKcj_6lSb5Lith6WoVFgjewW8mpc3hsVDmB9kuBqlKsik0-yNXSh8_2IU7jNOY9Nqiwgfu58ubnpTN_-eASDpGK5Ds3faDNY0eUovux-Pwv72XnEoO0HUs2koPfbOvEkGHq_34hGGHnb69GUv-aZKkozVI4b14xh6RSJL6etlQVTAyRuLHzoFGbBEyUyjuZuTUtbTAkFX_ibs9U6KGFF7xADCPBSHObgaRrGuTlJTUHMCL66GrqSqHTglWrYySh3BLxWo_lmtb9qHmPWFDl2u19hvfARL1L3W42TJ-_30HFI1OkkkI3o8oo9ZSqendjdT1-p0WkxoK-rDtb8xJkTEYSCI3VQIikuQLrEuRDY5r_RSocghljMZ8VPn6R4lDoq4WfM8InssSDKBXhrzKQPEJgUtUPAPIvykYM1l0-QtVZ0254sRti6anCDaCOLR2U-cXRnoPDZIheITIqoDdWAA7aU4srxvE6GPWRwRUvN2Tu1vKxt53zpxAhYptlZjyfQnITk-40qmk0gJgaaPqkKdSpB_vTNMSh-BbjkRFlTaWriPqslPOcwjysPAM44zRgcxtBPZwjZkiYcSpSJxBvJzm1qB-kcKjdXFhR0EDjUfK0llPpR46dD5fiybF8F1M_gCpV-OO2dNIoou73f8i6Pymq6Nq6bSMULEP16cNaEtF0q_oE6JTe_zXI21CwlmsIyPDLVpZrdtQiYa9H4-NdMoWOcxHjBBtwtE355ZGlWtfM95Yz6qvZH1hdNNRTTqAGu39lpdHadlcGXsoAGqB2yWc0ZtcVPWRes_Yib8uGnBqcb0115cUjPSWi4OLLuoK0d7XX5JDjSVc5sZqltosiUxEPI7Hv90_bPPcL1-tOwpLEHnU-uqJI5f7j4qjgBWAHhOtNmQF5H6g3CxNhd-nPWAsY7IHlpyVVYJDzabEXjQKh7GJpwHqVm6jpugrsZhZR69-V6M4irufC3VCELtIbhY1ESju_1yx2fxaxgvcn5OXBw6AGxDNu0SU6BBfirr0KJ6BWu-w3H5gtmYiJAIipC575yMaPNrj-cw57eLGwboIbYKgYGKhfNMx35hV8e5J9EVGBo3UJBIbv-vbSB5khRDY3bnexJbDKL8L1zrl2SkwfLQGatwHd2gj6oBhsluzvYpbR1Z4y3M7sAj4Bx0QQXtH77xoh-v_DVJTdfyBCqWxbFep7QY_28nQQgKMW4eWYUNsP3iz1-GTAV8PUS0_LiPFHIaAhakw5VcwbPbO30hA5NDZqoaXc43GOQ18uAG6RuEHmiRtGHEN9SdpNV5tZ-G19JjE0Bf21vFWtJL5_oK9rRbCHwiUza5k1bCVo_8oKSjZQVlcUOg2x0JhxoCWTuQ2ZEppuRG2eCxsK3otC3X-ziP6-j9twGgHkJYjwFiiVYRuAbTFwFy70V9XoEG77jru3LxJE2FTYq0U7EAsBLXaZyI9tHwkdkB50a_-ZGPQJAA2brcxpRiN-pIFP-jMF5RbyIcqFN6Zb_6KK6RNdV4CXtNVJBPr45prhbPH06gCnEWL95eTVIRkBh1lbrDBxrwrDn7dkYlissppI2DXQkvimiUPFhjN9sW_Eps4e6yRKytWoKh7ScNeSGPdv4CDKOh5zx1eaIBUUW9wdv4VyWyCZ4vJAgTzOekpEMRV-QbrRaU5zYExTIWFvmUHhGUpz1bzHk41sSHEfA5DQBRW5jiIwH4rxcnQ9R21tYIqvV0ElLzSVjXRoC4QcscfZ3-zTedESKJ_b9pSMsFEnSpXK0khDmY34IhaNdV9TnkqbsD9ZYpo1S1q32JhigUZnYJaSFH1S9AOh-mbFBrg3sst8ZMLqw1S7ubxfScbPMWG_jR34bCpXEd3SGziL4ictJygD-QwLvBv2lIxHqk-2AHnDyRgukRJbKrdZmp3qYngF6qdPhnK1DZO69GlHr5PQdI_7EzTpzkTzh5sXFOFqIKqvP_CtryQRBPS9xqhejiNiZvb0zBA69MXR3V4Wxss5d2nZwN-CD3nB_tqhMDXUfSQV1Ze-4N5nHzu9yeB2RkXJU5lvdrjoN7wrUxfRMveHwqgQdtug7Btidjq4Qnu8HGVXe3v34InNKc-VUTewsQoi-4ujFPR1_k5XeEPE7BW9FjHK_AfNKW4QNpK4JxJriUf6N5-U4iq5c_kSrgABCtLfPYZaZ_RABf-FLoL3wIrUbhavuYVjKCVXTOKPhgBQEj4Vlb0qa9ayGY-aFjHqXcQS_w6IkKIVfRRK5ooaHqZQ1HRk1WrCc-NxEwYOuSQG5KdJrNTtrmHxwtrX2iH5Sf_L82hS1rETNY1JX9KiQCoLPzVak4V5B-fmHBCHQWvaIbQWHGMxyjpvxwKQAJDws-BrWkUxHMtAyZJPFRRjrKw35_vl9qkCPk3NoqNwdFIBD38POCokT-4qKZ3PSdiLJ09IrDQGNcs5uzPrLkQaLlcJwFSgWTvIFt4traH-HlqqO75o-uxErAuNRlRqC1NpzoT5D-_0v-vbx6EGG27-M6ymCotblgSJSk-hC3B83d4oOco3S1zfPTogH_mY2JhWJwrQATew8rZhEBW0hsC37Hsu7WHN99_j4pZlWaBTSzfDRKvSsA9xCSVa9yq2kOqE7Y5qNJ-P6ENfFnyqVB_NzH12u8JbiL92xAljYR4Mnj3llAPlE6O0ZDtvo__nxURCY93mZp1r2p5oPqbz-ksHnvTVmZkqi8tmtDmDjw1R46MPj6AUPy-SM_wBzON3Ao1q5yg-14kaKi0wCEnkIxOK0jhRj_7oIt7jDfocjI2F3XbIUQlcKPCCm05UcgEXr6STxBfKDTE_9yQOL4qH5MBtA4yYNCZwV1f-eAYxC8Jf_H9H3ffvUOJbe9H-fM_sx5xku5QilSkDZZAE_AXFJBFgGR_So-hq95YddmUC0EQmsIChYSTd60BC7ApqjjMB-WqGKkHaxD3SeyXmv5_q5qU51SBh86sBrzRelTwEoGvJ3IkgDBdOTNy8UpkjmfsHEWWu1xo95yqK4Q1z6vgJfiDgSzBJyI3CLDbDsphQDfd1veZcGfKMhQ1UdHDJ_FRidwqzYaLQMElkK3pXIOsT0JtRgT0qeIewdBNb-1qfAjVbqyJilB16AGKraKcstASfSsslnrODeloYU3yvu-VYjykaf6_E2tz_WRWJYWVemwdMBQsh1h94W099mkmuhMTs-wHJTPTGOHw2PlHyShnB4vjn0h9o-hY9IzwlxOSnl_FYU__2MRApivtLX4s8_9a_HHqvcZLF7Rk_4qsc_t6w7ozFCguj5_3Wqi6jg2r5OlD81KQO4GVRKXsqkuKDCl1GkK0fzw-ORo6XcXZRQhJiX8pbk897E2IWIdwFDWUa7-pPhUMbHMw5E7cWZyxb4xSXCfzT3WLsrXDMnMcE65HoMuTEsOEVBbXp-oTJrxwDjfPJfGxWQdH1WIIktN9HTdVBi1uHUWic2V-BiB72Hhi55IxY8gBnZPXlD4PFdwZpPMfU5sAJ_Y1MiNzHsTzD8dsT8EXO4gOdbFbhJ3g0eeniooY4PHpA_qL-D_nxnlymwIEJGsEThdOJpgIBer_xgHY00PjqXikNEkL-oYp6r4cqiyLCe70eds0CE6Gken8EKsn6Bv_i9ZovMi8jsDEd4MQSituUgdb4IScssOyw21aJM4hGBp_eYHcmEzwIKcWbukug5hrEi7B5xD4Ji8aIvLbDqvq_uPe2-OLxTlh9dcdsktsaTxGm6usGMeb1KRmyEMQCvo_2hCvNezwHSJ0xfcheTIXIqID0XRuLypXB53PqwUzEa7GeMDjFh8a7kK2jI0Svs-HthVudponCHrEdxdauRfyMdgUD5vfzvI5wlbHE-eGF2LMUywMfL-myCI_YMOhlAiQ-PN66FWgnbu1MVhk9IviexrkeodtGxTvnY-XO-XVT3imTI-hgZ1SBfSw_Ltq4oXfO3ZHmPkwHFvL2w3ZE_iBMGVOKBWegnPr8zzmqJTdS3mwhAISIp83ZYD0dSnvnZ9DRI7HxBHwzaI3QKZqiwYbtyKs29M5Df4PEGL2xSL2aQt7XmZ1LVeJhz0ybeWKDQK9Owv-yOdhidGwRi2EaiHX2WaCu3V8D5OQQegnfGzKh1rgw2TAzkj9W5DDriS".replaceAll("_","\/").replaceAll("-","+");
// decrypt(str);

function get_sign(str) {
    // 假设 key 是你的密钥
    const key = "635a580fcb5dc6e60caa39c31a7bde48";

// 使用 CryptoJS 进行 HMAC MD5 加密
    const hmac = CryptoJS.HmacMD5(str, key);

// 转换为十六进制字符串
    var encryptedHex = hmac.toString(CryptoJS.enc.Hex);
    return encryptedHex;
    // console.log(encryptedHex);
}

// get_sign("1")

function get_pack(str) {
    return encryptData(str)
}

function get_list_params(type_id, _class = '类型', area = "地区", year = "年份", page = "1", pagesize = "21") {

    var json_data = {
        "type_id": type_id,
        "sort": "by_default",
        "class": _class,
        "area": area,
        "year": year,
        "page": page,
        "pageSize": "21",
        "timestamp": get_timestamp()
    }
    return JSON.stringify(json_data)
}

function get_search_params(keyword, page = "1", pageSize = "10", res_type = "by_movie_name") {
    const json_data = {
        "keyword": keyword,
        "page": page,
        "pageSize": "10",
        "res_type": "by_movie_name",
        "timestamp": get_timestamp()
    }
    return JSON.stringify(json_data)
}

function get_detail_params(id) {
    const json_data = {
        "id": id,
        "timestamp": get_timestamp()
    }
    return JSON.stringify(json_data)
}