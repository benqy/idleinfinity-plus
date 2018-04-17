//异步,批量出售
let form = $('form');
let eid = $("#eid")


let sellEquipById = (id, cb) => {
    eid.val(id)
    $.ajax({
        url: 'https://www.idleinfinity.cn/Equipment/EquipSell',
        type: 'post',
        data: form.serialize()
    })
        .done(data => cb())
        .fail(err => console.log('err', err))
}

let storeEquipById = (id, cb) => {
    eid.val(id)
    $.ajax({
        url: 'https://www.idleinfinity.cn/Equipment/EquipStore',
        type: 'post',
        data: form.serialize()
    })
        .done(data => cb())
        .fail(err => console.log('err', err))
}

let plugSell = bagpack => {
    bagpack.find('.equip-container > p').prepend('<input type="checkbox">')
    let btn = $('<a class="btn btn-xs btn-danger equip-sellbagchecked" href="javascript:;" role="button" style="margin-left:10px;">出售选中</a>')
    bagpack.find('.panel-footer .pull-right').prepend(btn)
    btn.on('click', () => {
        if (confirm('确认批量删除选中装备')) {
            let checboxs = bagpack.find('.equip-container > p input[type=checkbox]:checked').toArray()
            // checboxs.each((i, n) => {
            let sell = () => {
                if (checboxs.length) {
                    let item = $(checboxs.shift())
                    let id = item.siblings('.equip-sell').data('id')
                    item.siblings('.equip-name').css('text-decoration', 'line-through')
                    sellEquipById(id, () => {
                        item.parents('.equip-container').remove()
                        setTimeout(()=>{
                            sell()
                        },510)
                    })
                }
            }
            sell()
            //})
        }
    })
}

let plugStore = bagpack => {
    //bagpack.find('.equip-container > p').prepend('<input type="checkbox">')
    let btn = $('<a class="btn btn-xs btn-danger equip-storechecked" href="javascript:;" role="button" style="margin-left:10px;">收藏选中</a>')
    bagpack.find('.panel-footer .pull-right').prepend(btn)
    btn.on('click', () => {
        let checboxs = bagpack.find('.equip-container > p input[type=checkbox]:checked').toArray()
        let store = ()=>{
            if(checboxs.length){
                let item = $(checboxs.shift())
                let id = item.siblings('.equip-sell').data('id')
                storeEquipById(id, () => {
                    item.parents('.equip-container').appendTo($('.panel-inverse:eq(2) .panel-body'))
                    setTimeout(()=>{
                        store()
                    },510)
                })
            }
        }
        store()
    })
}

let plugOrderByName = () => {
    let input = $('<input value="" type="text" placeholder="角色排序(输入名称,逗号分隔)" class="btn-xs" style="border-radius:none;width:400px;margin-left:50px;margin-right:10px;">')
    let btn = $('<a href="javascript:;" class="btn btn-xs btn-primary" role="button" style="">排序</a>')
    let header = $('.col-md-12 .panel-heading .pull-right')
    header.append(input)
    header.append(btn)

    let order = () => {
        let panels = $('.col-md-4')
        let orderNames = input.val().split(',')
        let orderByName = []
        localStorage.setItem('order', input.val())

        orderNames.forEach(orderName => {
            panels.each((i, n) => {
                let name = $(n).find('.panel-inverse .panel-heading').text().trim().split('\n')[0]
                if (name.trim() == orderName.trim()) orderByName.push($(n))
            })
        })

        orderByName.forEach(n => {
            $('.container .row').append($(n))
        })
    }

    btn.on('click', order)
    input.val(localStorage.getItem('order'))
    order()
}
if (~location.href.indexOf('Equipment')) {
    console.log('加载装备页插件')
    plugSell($('.panel-inverse:eq(1)'))
    plugSell($('.panel-inverse:eq(2)'))
    plugStore($('.panel-inverse:eq(1)'))
}
if (~location.href.indexOf('Home')) {
    console.log('加载排序插件')
    plugOrderByName()
}
/* let storechecked = $('<a class="btn btn-xs btn-danger equip-storechecked" href="#" role="button">收藏选中</a>')
bagpack.find('.panel-footer .pull-right').prepend(storechecked) */


//<input type="text" placeholder="角色排序(输入名称,逗号分隔)">
//<a id="abc" href="javascript:;">排序</a>

/*  */
//$('.panel-inverse:eq(1) .equip-container > p input[type=checkbox]:checked')