<script>
    import { Link } from "yrv";

    let currentURL = new URL(window.location.href)
    let appId   = currentURL.searchParams.get("app_id")
    let rows1 = []

    fetch("http://test.adrunner.co.kr:8083/dashboard/list?app_id="+appId, {
            method: 'GET'
        }).then(response => response.json())
            .then(success =>{
            rows1 = success
            console.log(rows1)
        }).catch(error => {
            console.log(error);
            return [];
        })

    function remove(dashboardId){

        if(confirm("해당 대시보드를 정말로 삭제하시겠습니까?")){
            console.log("!")
            fetch("http://test.adrunner.co.kr:8083/dashboard/delete?id="+dashboardId, {
                    method: 'DELETE'
                }).then(success =>{
                    alert("대시보드가 정상적으로 삭제되었습니다.")
                }).catch(error => {
                    console.log(error);
                    return [];
                })
        }
    }

    function create(){
        if(confirm("대시보드를 신규로 생성하시겠습니까?")){

            let payload = {
                'appId':appId, 
                'name':window.$('#create-dashboard-name').val(),
                'campaignId':window.$('#create-dashboard-campaignid').val()
            }
          
            fetch("http://test.adrunner.co.kr:8083/dashboard/create", {
                method:'POST',   
                body:JSON.stringify( payload ),
                headers: {'Content-Type': 'application/json'}
                }).then(success => {
                    alert("대시보드가 정상적으로 생성되었습니다.")
                    location.replace('../dashboard?app_id='+appId)
                })
        }
    }

    function createDashboard(){
		window.$('#popup-create-dashboard').modal('show')
	}
 
</script>



<h1>대시보드</h1>
리포트에 있는 대시보드와 위젯 그대로 가져올 예정
 <table class='dashboard-list'>
     <thead>
         <td class='id'>항목 번호</td>
         <td class='name'>이름</td>
         <td class='createtime'>생성 시각/날짜</td>
         <td></td>
     </thead>
     <tbody>
         {#each rows1 as it}
            
                <tr>
                    <td>{it.id}</td>
                    <td>{it.name}</td>
                    <td>{it.createtime}</td>
                    <td>
                        <a href="/test10?app_id={appId}&dashboard_id={it.id}">보기</a>
                        <a href on:click={remove(it.id)}>삭제</a>
                    </td>
                </tr>
        {/each}
     </tbody>
 </table>
 
 <button type="button" class="btn btn-primary add-dashboard" on:click={createDashboard}>Create</button>

 <div class="modal" tabindex="-1" role="dialog" id='popup-create-dashboard'>
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">대시보드 등록</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">

            <div class='cont'>
                <div class='label'>이름 :</div>
                <div class='text'>
                    <input type='text' id='create-dashboard-name' placeholder='대시보드 이름'/>
                </div>
            </div>
   
            <div class='cont'>
                <div class='label'>캠페인 번호 :</div>
                <div class='text'>
                    <input type='text' id='create-dashboard-campaignid' placeholder='캠페인 번호'/>
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

    #popup-create-dashboard .modal-header{
        background-color:#00264d;
        color:white;
    }

    #popup-create-dashboard .modal-header button.close{
        color:white;
    }

    #popup-create-dashboard .modal-body .cont{
        margin-left:20px;
        margin-top:10px;
        margin-bottom:10px;
    }
    #popup-create-dashboard .modal-body .cont .label{
        display:inline-block;width:120px;font-size:17px;font-weight:600;
    }

    #popup-create-dashboard .modal-body .cont .text{
        display:inline-block;
    }

    #popup-create-dashboard .modal-body .cont .text input[type=text]{
        border-radius:3px;
    }


    table.dashboard-list{
        margin-top:60px;
    }

  

    table.dashboard-list tbody td a{
        margin-right:15px;
    }
    table.dashboard-list thead td.id{
        width:150px;
    }
    table.dashboard-list thead td.name{
        width:350px;
    }
    table.dashboard-list thead td.createtime{
        width:200px;
    }
 
    table.dashboard-list tr:hover{
        background-color:#f9f9f9;
    }


    .add-dashboard{
		width:100px;
        margin-top:100px;
    }
    
</style>