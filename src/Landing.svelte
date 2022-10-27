<script>
</script>
<h3 class='head-text'>랜딩 설정</h3>
<div class='land'>
    <div class='cont'>
        <div><h4>Android</h4></div>
        <div class='context'>
            <div class='header'><b>기본 URL (필수 입력사항)</b></div>
            <div class='link-textbox'>
                <input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
            <div class='header'><b>앱이 설치되었을 때</b></div>
            <div class='link-textbox'>
                <div class='label'>딥 링크 Scheme : </div><input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
            <div class='header'><b>앱이 설치되지 않았을 때</b></div>
            <div class='link-textbox'>
                <div class='label'>패키지 이름 : </div><input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
            <div class='footer'>
                <input type='checkbox'>App Link를 사용합니다.
            </div>
        </div>
    </div>

    <div class='cont'>
        <div><h4>iOS</h4></div>
        <div class='context'>
            <div class='header'><b>기본 URL (필수 입력사항)</b></div>
            <div class='link-textbox'>
                <input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
            <div class='header'><b>앱이 설치되었을 때</b></div>
            <div class='link-textbox'>
                <div class='label'>딥 링크 Scheme : </div><input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
            <div class='header'><b>앱이 설치되지 않았을 때</b></div>
            <div class='link-textbox'>
                <div class='label'>앱 스토어 ID : </div><input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
            <div class='footer'>
                <input type='checkbox'>Universal Link를 사용합니다.
            </div>
        </div>
    </div>

    <div class='cont desktop'>
        <div><h4>PC</h4></div>
        <div class='context desktop'>
            <div class='header'><b>기본 URL (필수 입력사항)</b></div>
            <div class='link-textbox'>
                <input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
            <div class='header'><b>앱 다운로드 페이지</b></div>
            <div class='link-textbox'>
                <input type='textbox' placeholder='http://petri.app.co.kr'/>
            </div>
        </div>
    </div>
</div>
<style>
    .land .cont{
        border-radius:6px; border:1px dotted #ececec;width:1300px;padding:30px;margin-top:20px;margin-bottom:70px;height:550px;
    }

    .land .cont .context{
        width:1200px;height:450px;background-color:#f9f9f9;
    }

    .land .cont .context.desktop{
        height:280px;
    }

    .land .cont.desktop{
        height:380px;
    }

    .land .cont .context .header{
        padding-left:40px; padding-top:43px;
    }


    .land .cont .context .link-textbox{
        padding-left: 40px;padding-top: 11px;
    }

    .land .cont .context .link-textbox .label{
        display:inline-block; width:140px;
    }

    .land .cont .context .footer{
        padding-left:40px; padding-top:40px;
    }

    .land .cont .context .footer input[type=checkbox]{
        margin-right:12px; top:1px; position:relative;
    }

    .land .cont .context .link-textbox input[type=textbox]{
        width:650px;
        height:35px;
        padding-left:10px;
    }
    
</style>