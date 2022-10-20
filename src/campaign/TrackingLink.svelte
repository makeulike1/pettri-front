<script>

    import { Link } from "yrv";

    export let appId
    export let campaignId

    let rows = []

    fetch(serverURL + "/tracking-link/list?app_id="+appId+"&campaign_id="+campaignId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows = success
            console.log(rows)
        }).catch(error => {
            console.log(error);
            return [];
        })




    function updateStatus(trkId, status){

        let text = ""

        if(status == 0)
            text = "트래킹을 다시 재개하시겠습니까?"
        if(status == 1)
            text = "트래킹을 중지하시겠습니까?"
        if(status == 2)
            text = "해당 트래킹 링크를 보류하시겠습니까?"

        if(confirm(text)){
            // 트래킹 링크 상태 수정
            fetch("http://test.adrunner.co.kr:8083/tracking-link/update-status/"+trkId+"/"+status, {
                method:'PUT'
                }).then(success => {

                    if(status == 0)
                        text = "트래킹이 다시 정상적으로 재개되었습니다."
                    if(status == 1)
                        text = "트래킹이 중지되었습니다."
                    if(status == 2)
                        text = "트래킹이 보류 처리되었습니다."
                        
                    alert(text)
                    location.replace('../campaign?app_id='+appId)
                })
        }

    }

    function modify(id){
        
        let payload={
            "id":id,
            "name":window.$('#trk-name-'+id).val(),
            "deepPath1":window.$('#deep-ios-path-'+id).val(),
            "deepPath2":window.$('#deep-android-path-'+id).val(),
            "storePath1":window.$('#store-ios-path-'+id).val(),
            "storePath2":window.$('#store-android-path-'+id).val(),
            "webPath":window.$('#web-path-'+id).val()
        }

        console.log(payload)

        if(confirm("해당 트래킹 링크를 정말로 수정하시겠습니까?")){
            // 트래킹 링크 수정
            fetch("http://test.adrunner.co.kr:8083/tracking-link/modify", {
                method:'PUT',   
                body:JSON.stringify( payload ),
                headers: {
                    'Content-Type': 'application/json'
                    }
                }).then(success => {
                    alert("트래킹 링크를 정상적으로 수정하였습니다.")
                    location.replace('../campaign?app_id='+appId)
                })
            }
    }



</script>

<h3>트래킹 링크</h3>

<table class='trk-list'>
    <tbody>
        {#each rows as it}
            <tr>
                <td>
                    <b> 트래킹 번호 :</b>&nbsp;{it.id}
                    <br>
                    <b> 트래킹 이름 :</b>&nbsp;<input type='text' id='trk-name-{it.id}' value={it.name}/>
                    <br>
                    <b> 트래킹 ID : </b>&nbsp;{it.trackingId}
                    <br>
                    <br>
                    <b> 트래킹 상태 : </b>&nbsp;

                    {#if it.status == 0}
                    활성화
                    {:else if it.status == 1}
                    중지
                    {:else if it.status == 2}
                    보류됨
                    {/if}

                    <br>
                    <br>
                    <b>딥링킹 경로</b>
                    <table>
                        <tbody>
                            <tr>
                                <td>iOS 경로</td>
                                <td><input type='text' id='deep-ios-path-{it.id}' value={it.deepPath1}/></td>
                            </tr>
                            <tr>
                                <td>안드로이드 경로</td>
                                <td><input type='text' id='deep-android-path-{it.id}' value={it.deepPath2}/></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <br>

                    <b>스토어 경로</b>
                    <table>
                        <tbody>
                            <tr>
                                <td>iOS 경로</td>
                                <td><input type='text' id='store-ios-path-{it.id}' value={it.storePath1}/></td>
                            </tr>
                            <tr>
                                <td>안드로이드 경로</td>
                                <td><input type='text' id='store-android-path-{it.id}' value={it.storePath2}/></td>
                            </tr>
                        </tbody>
                    </table>
                    <br>
                    <b> 웹 경로 : </b>&nbsp;<input type='text' id='web-path-{it.id}' value={it.webPath}/>
                    <br>
                    수정 날짜/시각 : {it.updatetime}
                    <br>
                    삽입 날짜/시각 : {it.createtime}
                    <br>
                    <br>
                    <div class='table-footer'>
                        <button type="button" class="btn btn-primary" on:click={()=>modify(it.id)}>수정</button>
                        {#if it.status == 0}
                        <button type="button" class="btn btn-secondary" on:click={()=>updateStatus(it.id, 1)}>트래킹 중지</button>
                        {:else if it.status == 1}
                        <button type="button" class="btn btn-secondary" on:click={()=>updateStatus(it.id, 0)}>트래킹 재개</button>
                        <button type="button" class="btn btn-secondary" on:click={()=>updateStatus(it.id, 2)}>트래킹 보류</button>
                        {/if}
                    </div>
                </td>
            </tr>
        {/each}
    </tbody>
</table>


<div class='footer'>
    <Link href="/campaign-info/cctl?app_id={appId}&campaign_id={campaignId}">링크 신규 생성</Link>
</div>    

<style>
    .table-footer{ 
        border-bottom: 1px dotted gray;
        padding-bottom: 35px;
    }

    .footer{
        margin-top:75px;
    }

    
</style>