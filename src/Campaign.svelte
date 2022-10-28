<script>

    import { Link} 			from "yrv";
    let currentURL = new URL(window.location.href)
    let appId       = currentURL.searchParams.get("app_id")
    let cpList      = []

    fetch(serverURL + "/campaign/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            cpList = success
            console.log(cpList)
        }).catch(error => {
            console.log(error);
            return [];
        })


    function remove(id){

        if(confirm("해당 캠페인을 정말로 삭제하시겠습니까?")){
            console.log("!")
            fetch("http://test.adrunner.co.kr:8083/campaign/delete?id="+id, {
                    method: 'DELETE'
                }).then(success =>{
                    alert("캠페인이 정상적으로 삭제되었습니다.")
                }).catch(error => {
                    console.log(error);
                    return [];
                })
        }
    }


    function create(){
        if(confirm("캠페인을 신규로 생성하시겠습니까?")){

            let payload = {
                'appId':appId, 
                'name':window.$('#create-campaign-name').val()
            }

            fetch("http://test.adrunner.co.kr:8083/campaign/create", {
                method:'POST',   
                body:JSON.stringify( payload ),
                headers: {'Content-Type': 'application/json'}
                }).then(success => {
                    alert("캠페인이 정상적으로 생성되었습니다.")
                    location.replace('../campaign?app_id='+appId)
                })
        }

    }

    function createCampaign(){
		window.$('#popup-create-campaign').modal('show')
	}

</script>

<h3 class='head-text'>캠페인 설정</h3>
<table class='campaign-list'>
    <thead>
        <td>캠페인 번호</td>
        <td>캠페인 이름</td>
        <td>수정 날짜/시각</td>
        <td>생성 날짜/시각</td>
        <td></td>
        <td></td>
    </thead>
    <tbody>
        {#each cpList as it}
            <tr>
                <td>{it.id}</td>
                <td>{it.name}</td>
                <td>{it.updatetime}</td>
                <td>{it.createtime}</td>
                <td><Link href="/campaign-info?app_id={appId}&campaign_id={it.id}">상세 보기</Link>
                <td><a href on:click={remove(it.id)}>삭제</a></td>
            </tr>
        {/each}
    </tbody>
</table>

<button type="button" class="btn btn-primary add-campaign" on:click={createCampaign}>Create</button>
 
<div class="modal" tabindex="-1" role="dialog" id='popup-create-campaign'>
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">캠페인 등록</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">

            <div class='cont'>
                <div class='label'>이름 :</div>
                <div class='text'>
                    <input type='text' id='create-campaign-name' placeholder='캠페인 이름'/>
                </div>
            </div>

        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" on:click={create} data-dismiss="modal">등록</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
        </div>
      </div>
    </div>
</div>


<style>
    table.campaign-list{
    margin-top:45px;
    }
    table.campaign-list thead td{
        width:250px;
        background-color:#f9f9f9;
        height:37px;
        font-size:18px;
        font-weight:600;
    }

    table.campaign-list tbody tr{
        border-bottom:1px dotted #ececec;
        height:38px;
    }

    table.campaign-list tbody tr:last-of-type{
        border-bottom: none;
    }

    button.add-campaign{
        margin-top:100px;
    }

    #popup-create-campaign .modal-header{
        background-color:#00264d;
        color:white;
    }

    #popup-create-campaign .modal-header button.close{
        color:white;
    }

    #popup-create-campaign .modal-body .cont{
        margin-left:20px;
        margin-top:10px;
        margin-bottom:10px;
    }
    #popup-create-campaign .modal-body .cont .label{
        display:inline-block;width:120px;font-size:17px;font-weight:600;
    }

    #popup-create-campaign .modal-body .cont .text{
        display:inline-block;
    }

    #popup-create-campaign .modal-body .cont .text input[type=text]{
        border-radius:3px;
    }


</style>