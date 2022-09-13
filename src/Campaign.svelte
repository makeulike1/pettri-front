<script>
import CampaignInfo from "./CampaignInfo.svelte";

function showCampaign(){
    window.$('#ci').modal('show')
}

</script>
<h3 class='head-text'>캠페인 설정</h3>
<table class='campaign-list'>
    <thead>
        <td>캠페인 이름</td>
        <td>파트너</td>
        <td>포스트백 설정</td>
        <td>수정 날짜/시각</td>
        <td>생성 날짜/시각</td>
        <td></td>
    </thead>
    <tbody>
        <tr>
            <td>모비온</td>
            <td>구글 애즈</td>
            <td>오픈 포스트백<br>이벤트 포스트백</td>
            <td>2022-09-02 11:14</td>
            <td>2022-09-05 12:01</td>
            <td><span on:click={showCampaign} class='load-campaign'>상세 보기</span></td>
        </tr>
        <tr>
            <td>performance_NCPI</td>
            <td>구글 애즈</td>
            <td>오픈 포스트백<br>이벤트 포스트백</td>
            <td>2022-09-02 11:14</td>
            <td>2022-09-05 12:01</td>
            <td><span on:click={showCampaign} class='load-campaign'>상세 보기</span></td>
        </tr>
        <tr>
            <td>performance_NCPI</td>
            <td>구글 애즈</td>
            <td>오픈 포스트백<br>이벤트 포스트백</td>
            <td>2022-09-02 11:14</td>
            <td>2022-09-05 12:01</td>
            <td><span on:click={showCampaign} class='load-campaign'>상세 보기</span></td>
        </tr>
        <tr>
            <td>performance_NCPI</td>
            <td>구글 애즈</td>
            <td>오픈 포스트백<br>이벤트 포스트백</td>
            <td>2022-09-02 11:14</td>
            <td>2022-09-05 12:01</td>
            <td><span on:click={showCampaign} class='load-campaign'>상세 보기</span></td>
        </tr>
        <tr>
            <td>performance_NCPI</td>
            <td>구글 애즈</td>
            <td>오픈 포스트백<br>이벤트 포스트백</td>
            <td>2022-09-02 11:14</td>
            <td>2022-09-05 12:01</td>
            <td><span on:click={showCampaign} class='load-campaign'>상세 보기</span></td>
        </tr>
    </tbody>
</table>

<CampaignInfo/>