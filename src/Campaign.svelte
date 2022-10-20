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

</script>

<h3 class='head-text'>캠페인 설정</h3>
<table class='campaign-list'>
    <thead>
        <td>캠페인 번호</td>
        <td>캠페인 이름</td>
        <td>수정 날짜/시각</td>
        <td>생성 날짜/시각</td>
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
            </tr>
        {/each}
    </tbody>
</table>

 
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

</style>