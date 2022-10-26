<script>
       
    let currentURL = new URL(window.location.href)
    let appId   = currentURL.searchParams.get("app_id")
    let rows1 = []
    let rows2 = []
    let rows3 = []
    let rows4 = []
    let rows5 = []

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


<h1>대시보드</h1>
리포트에 있는 대시보드와 위젯 그대로 가져올 예정


<div class='stat'>
    <span class='count'>광고 노출 수 : {totalImp}</span>
    <br>
    <span class='count'>앱 설치 수 : {totalInstall}</span>
</div>

<h4>노출 로그</h4>
<table>
    <thead>
        <td class='datetime'>클릭 날짜/시각</td>
        <td class='cp-id'>캠페인 항목번호</td>
        <td class='trk-id'>트래킹 아이디</td>
        <td class='ck'>매체사 클릭키</td>
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


<h4>트래킹 링크 클릭 로그</h4>
<table>
    <thead>
        <td class='datetime'>클릭 날짜/시각</td>
        <td class='cp-id'>캠페인 항목번호</td>
        <td class='trk-id'>트래킹 아이디</td>
        <td>매체사 클릭키</td>
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




<h4>인스톨 로그</h4>
<table class='install'>
    <thead>
        <td class='datetime'>설치 날짜/시각</td>
        <td class='trk-id'>트래킹 아이디</td>
        <td>어트리뷰션 아이디</td>
        <td class='ck'>매체사 클릭키</td>
        <td>속성</td>
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



<h4>회원 데이터베이스</h4>
<table class='user'>
    <thead>
        <td class='datetime'>회원 생성 날짜/시각</td>
        <td>어트리뷰션 아이디</td>
        <td class='user-id'>회원 아이디</td>
        <td>속성</td>
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


<h4>이벤트 데이터베이스</h4>
<table>
    <thead>
        <td class='datetime'>이벤트 생성 날짜/시각</td>
        <td>어트리뷰션 아이디</td>
        <td>이벤트 이름</td>
        <td class='user-id'>회원 아이디</td>
        <td>속성</td>
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

    .stat{
        margin-top:50px;
    }

    .stat .count{
        font-size:20px;
        font-weight:600;
    }

    h4{
        margin-top:95px;
        font-weight:600;
    }

    table thead{
        background-color: #00264d;
        color:white;
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