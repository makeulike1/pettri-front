<script>
    
    export let campaignId
    export let appId

    function create(){
        let payload={
            "appId":appId,
            "campaignId":campaignId,
            "name":window.$('#name').val(),
            "deepPath":window.$('#deep-path').val(),
            "storePath":window.$('#store-path').val(),
            "webPath":window.$('#web-path').val(),
        }
        if(confirm("트래킹 링크를 신규로 생성하시겠습니까?")){
            
            // 트래킹 링크 생성
            fetch("http://test.adrunner.co.kr:8083/tracking-link/create", {
                method:'POST',   
                body:JSON.stringify( payload ),
                headers: {'Content-Type': 'application/json'}
                }).then(success => {
                    alert("트래킹 링크가 정상적으로 생성되었습니다.")
                    location.replace('../campaign?app_id='+appId)
                })
            }
    }
</script>
<h3>트래킹 링크 신규 생성</h3>

<table>
    <tbody>
        <tr>
            <td rowspan="2" class='label'>딥링킹 경로</td>
            <td><b>안드로이드 : </b></td>
            <td><input type='text' id='deep-path' placeholder='coinoneapp://Path'></td>
        </tr>
        <tr>
            <td rowspan="2" class='label'>스토어 경로</td>
            <td><b>안드로이드 : </b></td>
            <td><input type='text' id='store-path' placeholder='coinone.co.kr.official'></td>
        </tr>
        <tr>
            <td class='label'>웹 경로</td>
            <td col=2>
                <input type='text' id='web-path' placeholder='https://coinone.co.kr/'>
            </td>
        </tr>
        <tr>
            <td class='label'>이름</td>
            <td col=2>
                <input type='text' id='name' placeholder='트래킹 링크'>
            </td>
        </tr>
    </tbody>
</table>
<button type="button" class="btn btn-primary create-trk" on:click={create}>생성</button>

<style>

    input[type=text]{
        border-radius:3px;
    }

    button.create-trk{
        margin-top:30px;
    }

    table tbody tr td.label{
        color:white;
        background-color:#00264d;
        width:150px;
        font-weight:500;
    }
    table tbody tr td{
        padding-left:10px;
    }
</style>

