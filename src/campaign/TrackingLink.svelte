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



    function showPopup(clickURL, impURL){
        window.$('#trk-popup').modal('show')
        window.$('#click-url').text(clickURL)
        window.$('#imp-url').text(impURL)
    }

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
            "deepPath":window.$('#deep-path-'+id).val(),
            "storePath":window.$('#store-path-'+id).val(),
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
                })
            }
    }



</script>

<h3>트래킹 링크</h3>

<table class='trk-list'>
    <thead>
        <td class='number'>번호</td>
        <td class='name'>이름</td>
        <td class='tracking-id'>트래킹ID</td>
        <td class='status'>상태</td>
        <td></td>
        <td></td>
    </thead>
    <tbody>
        {#each rows as it}
            <tr class='row-1'>
                <td class='padd'>{it.id}</td>
                <td class='padd'><input type='text' id='trk-name-{it.id}' value={it.name}/></td>
                <td class='padd'>{it.trackingId}</td>
                <td class='padd'>
                    {#if it.status == 0}
                    활성화
                    {:else if it.status == 1}
                    중지
                    {:else if it.status == 2}
                    보류됨
                    {/if}</td>
                    <td class='padd'>
                        <b>딥링크 경로</b>
                        <table>
                            <tbody>
                                <tr>
                                    <td class='path'>경로</td>
                                    <td class='textbox'><input type='text' id='deep-path-{it.id}' value={it.deepPath}/></td>
                                </tr>
                            </tbody>
                        </table>
                        <br>    
                        <b>스토어 경로</b>
                        <table>
                            <tbody>
                                <tr>
                                    <td class='path'>경로</td>
                                    <td class='textbox'><input type='text' id='store-path-{it.id}' value={it.storePath}/></td>
                                </tr>
                            </tbody>
                        </table>
                        <br>
                        <div class='web-path'>웹 경로</div>
                        <input type='text' class='web-path-textbox' id='web-path-{it.id}' value={it.webPath}/>
                    </td>
                    <td class='padd'>
                            <button type="button" class="btn btn-primary" on:click={()=>modify(it.id)}>수정</button>
                        {#if it.status == 0}
                            <button type="button" class="btn btn-secondary" on:click={()=>updateStatus(it.id, 1)}>트래킹 중지</button>
                        {:else if it.status == 1}
                            <button type="button" class="btn btn-secondary" on:click={()=>updateStatus(it.id, 0)}>트래킹 재개</button>
                            <button type="button" class="btn btn-secondary" on:click={()=>updateStatus(it.id, 2)}>트래킹 보류</button>
                        {/if}
                        <br>
                        수정 날짜/시각 : {it.updatetime}
                        <br>
                        생성 날짜/시각 : {it.createtime}
                        <br>
                        <div class='td-footer'>
                            <span class='show-popup' on:click={()=>showPopup(it.clickUrl, it.impUrl)}>링크 보기</span>
                        </div>
                    </td>
            </tr>
        {/each}
    </tbody>
</table>


<div class='footer'>
    <Link href="/campaign-info/cctl?app_id={appId}&campaign_id={campaignId}">링크 신규 생성</Link>
</div>    

<div class="modal trk-link" tabindex="-1" role="dialog" id='trk-popup'>
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">트래킹 링크</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
            <br>
            <b>클릭 URL</b>
            <br>
            <span id='click-url'></span>
            <br>
            <br>
            <br>
            <b>노출 URL</b>
            <br>
            <span id='imp-url'></span>
            <br>
            <br>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
        </div>
      </div>
    </div>
</div>

<style>

    .td-footer{
        margin-top:20px;
    }

    span.show-popup{
        cursor:pointer;
        color:blue;
    }
    span.show-popup:hover{
        text-decoration: underline;
    }
 
    .modal.trk-link .modal-dialog{
        max-width:800px;
    }

    .modal.trk-link .modal-header{
        background-color:#00264d;
        color:white;
        font-weight:600;
    }

    .footer{
        margin-top:75px;
    }
    
    table.trk-list table td input[type=text]{
        width:300px;
    }
    table.trk-list table td.path{
        width:150px;
    }
    table.trk-list table td.textbox{
        width:350px;
    }

    .web-path{
        width:150px;
        display:inline-block;
        font-weight:600;
    }
    .web-path-textbox{
        width:300px;
    }

    table.trk-list thead td.number{
        width:70px;
    }
    table.trk-list thead td.name{
        width:250px;
    }
    table.trk-list thead td.tracking-id{
        width:120px;
    }
    table.trk-list thead td.status{
        width:110px;
    }

    table.trk-list tbody td{
        border-right:1px dotted #ececec;
    }

    table.trk-list tbody td.padd{
        padding-left:20px;
        padding-right:20px;
    }

    table.trk-list tr.row-1{
        border-bottom: 1px dotted gray;
        height: 350px;
    }
    table.trk-list tr.row-1:last-of-type{
        border-bottom:none;
    }

    table thead{
        background-color:#00264d;
        color:white;
        height:30px;
    }
    
</style>