<script>
    import FraudBlackListIPSignUp 	 from "./FraudBlackListIPSignUp.svelte"    
    function signupIP(){
        window.$('#signup-ip').modal('show')
    }

</script>
<table class='fraud'>
    <thead>
        <td class='ip'>IP 주소</td>
        <td class='reason'>사유</td>
        <td class='datetime'>생성 날짜</td>
        <td></td>
    </thead>
    <tbody>
        <tr>
            <td>172.1.1.16</td>
            <td>5/3일 엔스테이션 중복 IP</td>
            <td>2022-05-03 13:12:20</td>
            <td></td>
        </tr>
        <tr>
            <td>172.1.1.16</td>
            <td>5/3일 엔스테이션 중복 IP</td>
            <td>2022-05-03 13:12:20</td>
            <td></td>
        </tr>
        <tr>
            <td>172.1.1.16</td>
            <td>5/3일 엔스테이션 중복 IP</td>
            <td>2022-05-03 13:12:20</td>
            <td></td>
        </tr>
        <tr>
            <td>172.1.1.16</td>
            <td>5/3일 엔스테이션 중복 IP</td>
            <td>2022-05-03 13:12:20</td>
            <td></td>
        </tr>
        <tr>
            <td>172.1.1.16</td>
            <td>5/3일 엔스테이션 중복 IP</td>
            <td>2022-05-03 13:12:20</td>
            <td></td>
        </tr>
        <tr>
            <td>172.1.1.16</td>
            <td>5/3일 엔스테이션 중복 IP</td>
            <td>2022-05-03 13:12:20</td>
            <td></td>
        </tr>
        <tr>
            <td>172.1.1.16</td>
            <td>5/3일 엔스테이션 중복 IP</td>
            <td>2022-05-03 13:12:20</td>
            <td></td>
        </tr>
    </tbody>
</table>
<button type="button" class="btn btn-primary" on:click={signupIP} data-dismiss="modal">등록</button>
<FraudBlackListIPSignUp/>
<style>
    table.fraud{
        margin-top:20px;
        width:1200px;
        margin-bottom:50px;
    } 
    table.fraud thead td.ip{
        width:160px;
    }
    table.fraud thead td.datetime{
        width:200px;
    }
    table.fraud thead td{
        background-color:#f9f9f9;
        height:37px;
        font-size:18px;
        font-weight:600;
        padding-left:10px;
    }

    table.fraud tbody tr{
        border-bottom:1px dotted #ececec;
        height:45px;
    }

    table.fraud tbody tr td{
        padding-left:10px;
    }

    table.fraud tbody tr:last-of-type{
        border-bottom: none;
}
</style>