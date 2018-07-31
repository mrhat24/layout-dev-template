let pages = process.env.pages;
require('../dev.sass');

$(document).ready(()=>{
    (
        function initDevNavigation(){
            let active = '';
            if(sessionStorage.getItem('navOpen') == 1){
                active = ' active';
            }
            $("body").append(`<div class='dev-nav ${active}'>
                    <div class='dev-nav-title'>Навигация</div>
                    <div class='dev-nav-body'></div>
                    </div>`);
            for(let page of pages){
                $(".dev-nav-body").append(`<a href="${page.name}" class='dev-nav-element'>${page.name}</a>`);
            }

            $(".dev-nav-title").on("click", function () {
                $(".dev-nav").toggleClass('active');
                if($(".dev-nav").hasClass('active')){
                    sessionStorage.setItem('navOpen', 1);
                }else{
                    sessionStorage.setItem('navOpen', 0);
                }
            })
        }
    )();
});