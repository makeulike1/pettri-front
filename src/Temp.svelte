<script>
    import { intros } from "svelte/internal";

       
    let currentURL = new URL(window.location.href)
    let appId   = currentURL.searchParams.get("app_id")
    let rows1 = []
    let rows2 = []
    let rows3 = []
    let rows4 = []
    let rows5 = []
    let rows6 = []

    let totalInstall = 0;
    let totalImp = 0;
 
    fetch(serverURL + "/install/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows1 = success
            console.log(rows1)
        }).catch(error => {
            console.log(error);
            return [];
        })



    fetch(serverURL + "/user/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows2 = success
            console.log(rows2)
        }).catch(error => {
            console.log(error);
            return [];
        })
        


    fetch(serverURL + "/event/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows3 = success
            console.log(rows3)
        }).catch(error => {
            console.log(error);
            return [];
        })



    fetch(serverURL + "/tracking-link/click/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows4 = success
            console.log(rows4)
        }).catch(error => {
            console.log(error);
            return [];
        })


    fetch(serverURL + "/imp/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows5 = success
            console.log(rows5)
        }).catch(error => {
            console.log(error);
            return [];
        }) 


    fetch(serverURL + "/re-install/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows6 = success
            console.log(rows6)
        }).catch(error => {
            console.log(error);
            return [];
        }) 


    fetch(serverURL + "/pettri/test1?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            totalInstall = success.totalInstall
            totalImp = success.totalImp
        }).catch(error => {
            console.log(error);
            return [];
        }) 

</script>

<div class='stat'>
    <span class='count'>?????? ?????? ??? : {totalImp}</span>
    <br>
    <span class='count'>??? ?????? ??? : {totalInstall}</span>
</div>

<h4>?????? ??????</h4>
<table>
    <thead>
        <td class='datetime'>?????? ??????/??????</td>
        <td class='cp-id'>????????? ????????????</td>
        <td class='trk-id'>????????? ?????????</td>
        <td class='ck'>????????? ?????????</td>
    </thead>
    <tbody>
        {#each rows5 as it}
            <tr>
                <td>{it.createtime}</td>
                <td>{it.campaignId}</td>
                <td>{it.trackingId}</td>
                <td>{it.clickKey}</td>
            </tr>
        {/each}

    </tbody>
</table>


<h4>????????? ?????? ??????</h4>
<table>
    <thead>
        <td class='datetime'>?????? ??????/??????</td>
        <td class='cp-id'>????????? ????????????</td>
        <td class='trk-id'>????????? ?????????</td>
        <td>????????? ?????????</td>
    </thead>
    <tbody>
        {#each rows4 as it}
            <tr>
                <td>{it.createtime}</td>
                <td>{it.campaignId}</td>
                <td>{it.trackingId}</td>
                <td>{it.clickKey}</td>
            </tr>
        {/each}

    </tbody>
</table>




<h4>????????? ( ??? ?????? ?????? )</h4>
<table class='install'>
    <thead>
        <td class='datetime'>?????? ??????/??????</td>
        <td class='trk-id'>????????? ?????????</td>
        <td>??????????????? ?????????</td>
        <td class='ck'>????????? ?????????</td>
        <td>??????</td>
    </thead>
    <tbody>
        {#each rows1 as it}
            <tr>
                <td>{it.createtime}</td>
                <td>{it.trkId}</td>
                <td>{it.attrId}</td>
                <td>{it.ck}</td>
                <td>
                    <table>
                        <tbody>
                            {#each it.prop as it1}
                                <tr>
                                    <td>{it1.key}</td>
                                    <td>{it1.value}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </td>
            </tr>
        {/each}

    </tbody>
</table>

<h4>?????????</h4>
<table class='install'>
    <thead>
        <td class='datetime'>?????? ??????/??????</td>
        <td class='trk-id'>????????? ?????????</td>
        <td>??????????????? ?????????</td>
        <td>???????????? ?????????</td>
        <td class='ck'>????????? ?????????</td>
    </thead>
    <tbody>
        {#each rows6 as it}
            <tr>
                <td>{it.createtime}</td>
                <td>{it.trackingId}</td>
                <td>{it.attrId}</td>
                <td>{it.deviceId}</td>
                <td>{it.clickKey}</td>
            </tr>
        {/each}

    </tbody>
</table>



<h4>?????? ??????????????????</h4>
<table class='user'>
    <thead>
        <td class='datetime'>?????? ?????? ??????/??????</td>
        <td>??????????????? ?????????</td>
        <td class='user-id'>?????? ?????????</td>
        <td>??????</td>
    </thead>
    <tbody>
        {#each rows2 as it}
            <tr>
                <td>{it.createtime}</td>
                <td>{it.attrId}</td>
                <td>{it.userId}</td>
                <td>
                    <table class='user-prop'>
                        <tbody>
                            {#each it.prop as it1}
                                <tr>
                                    <td>{it1.key}</td>
                                    <td>{it1.value}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </td>
            </tr>
        {/each}

    </tbody>
</table>


<h4>????????? ??????????????????</h4>
<table>
    <thead>
        <td class='datetime'>????????? ?????? ??????/??????</td>
        <td>??????????????? ?????????</td>
        <td>????????? ??????</td>
        <td class='user-id'>?????? ?????????</td>
        <td>??????</td>
    </thead>
    <tbody>
        {#each rows3 as it}
            <tr>
                <td>{it.createtime}</td>
                <td>{it.attrId}</td>
                <td>{it.name}</td>
                <td>{it.userId}</td>
                <td>
                    <table class='user-prop'>
                        <tbody>
                            {#each it.prop as it1}
                                <tr>
                                    <td>{it1.key}</td>
                                    <td>{it1.value}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </td>
            </tr>
        {/each}

    </tbody>
</table>

<style>


    .stat .count{
        font-size:20px;
        font-weight:600;
    }

    h4{
        margin-top:95px;
        font-weight:600;
    }

    table thead{
        background-color:#f9f9f9;
        border-bottom:1px dotted gray;
        font-weight:500;
        height:40px;
    }

    table td{
        border-right:1px dotted #bdbdbd;
        padding-left:15px;
        padding-right:30px;
    }

    table tbody td:last-of-type{
        border-right:none;
    }

    table.install tr{
        border-bottom:1px dotted #ececec;
        height:35px;
    }

    table.install tr:last-of-type{
        border-bottom:none;
    }


  

    table.user tr{
        border-bottom:1px dotted #ececec;
        height:35px;
    }

    table.user tr:last-of-type{
        border-bottom: none;
    }

    table thead td.datetime{
        width:250px;
    }

    table thead td.ck{
        width:450px;
    }

    table thead td.trk-id{
        width:150px;
    }

    table thead td.cp-id{
        width:170px;
    }
 
    table thead td.user-id{
        width:170px;
    }


</style>