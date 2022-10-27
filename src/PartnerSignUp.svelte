<script>
    
</script>
<div class="modal partner" tabindex="-1" role="dialog" id='signup'>
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">파트너 등록</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
           <div class='label'>회사 혹은 플랫폼 이름</div> 
           <div class='text'>
               <input type='textbox'/>
            </div>
           <div class='label'>매니저 성함</div> 
           <div class='text'>
               <input type='textbox'/>
            </div>
            <div class='label'>매니저 이메일</div> 
            <div class='text'>
               <input type='textbox'/>
            </div>
            <div class='label'>매니저 연락처</div> 
            <div class='text'>
               <input type='textbox'/>
            </div>
            <div class='label'>설명</div> 
            <div class='text'>
               <textarea/>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal">등록</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
        </div>
      </div>
    </div>
</div>
<style>

   .modal.partner .modal-content{
        border:none;
        width:650px;
    }

    .modal.partner .modal-header{
        background-color:#00264d;
        color:white;
    }

    .modal.partner .modal-header .close{
        color:white;
    }

    .modal.partner .modal-body{
        padding:30px 39px;
    }

    .modal.partner .modal-body .label:first-of-type{
        font-size:18px;
        font-weight:500;
        color:#404040;
        margin-top:0px;
    }
    .modal.partner .modal-body .label{
        margin-top:40px;
    }
    .modal.partner .modal-body .text{
        margin-top:7px;
        margin-bottom:7px;
    }

    .modal.partner .modal-body .text textarea{
        width:550px;
        border-radius:6px;
        cursor:pointer;
        height:150px;
    }

    .modal.partner .modal-body .text input[type=textbox]{
        width:550px;
        border-radius:6px;
        cursor:pointer;
    }

    .modal.partner .modal-body .text input[type=textbox]:hover{
        border:1px solid blue;
    }

</style>