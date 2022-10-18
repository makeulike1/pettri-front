<script>
    import PartnerSignUp from "./PartnerSignUp.svelte";
    
    function signUp(){
        window.$('#signup').modal('show')
    }

</script>
<h3 class='head-text'>광고 파트너</h3>
<table class='partner'>
    <thead>
        <td>아이콘</td>
        <td>파트너 이름</td>
        <td>활성화 여부</td>
        <td></td>
    </thead>
    <tbody>
        <tr>
            <td></td>
            <td>3dpop</td>
            <td>비활성화</td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
        <tr>
            <td></td>
            <td>a.f.z</td>
            <td>비활성화</td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
        <tr>
            <td></td>
            <td>Ad.zip(애드짚)</td>
            <td><span class='active'>활성화</span></td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
        <tr>
            <td></td>
            <td>ADBC</td>
            <td>비활성화</td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
        <tr>
            <td></td>
            <td>adbox</td>
            <td>비활성화</td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
        <tr>
            <td></td>
            <td>AdBrix</td>
            <td>비활성화</td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
        <tr>
            <td></td>
            <td>adcolony</td>
            <td>비활성화</td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
        <tr>
            <td></td>
            <td>adison</td>
            <td>비활성화</td>
            <td><span class='config'>상세 설정</span></td>
        </tr>
    </tbody>
</table>

<button type="button" on:click={signUp} class="btn btn-primary">파트너 등록</button>

<PartnerSignUp/>

<style>
    table.partner{
        margin-top:45px;
    }
    table.partner thead td{
        width:250px;
        background-color:#f9f9f9;
        height:37px;
        font-size:18px;
        font-weight:600;
        padding-left:10px;
    }

    table.partner tbody tr{
        border-bottom:1px dotted #ececec;
        height:45px;
    }

    table.partner tbody tr td{
        padding-left:10px;
    }

    table.partner tbody tr td span.active{
        color:green;
    }


    table.partner tbody tr:last-of-type{
        border-bottom: none;
    }



    table.partner tbody span.config{
        cursor:pointer;
    }

    table.partner tbody span.config:hover{
        color:blue;
        text-decoration: underline;
    }


</style>

