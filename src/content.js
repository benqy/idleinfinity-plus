//异步,批量出售
let form = $('form')
let eid = $("#eid")
$('canvas').hide()

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
                        setTimeout(() => {
                            sell()
                        }, 1100)
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
        let store = () => {
            if (checboxs.length) {
                let item = $(checboxs.shift())
                let id = item.siblings('.equip-sell').data('id')
                storeEquipById(id, () => {
                    item.parents('.equip-container').appendTo($('.panel-inverse:eq(2) .panel-body'))
                    setTimeout(() => {
                        store()
                    }, 1100)
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

let timelimit = 1500
let plugAutoDungeon = () => {
    let updateBlocks = el => {
        blocks = blocks.not(el)
    }

    //找出旁边有未探索空格的点
    let blockNearUnlock = (block) => {
        let b = block
        let id = b.attr('id')
        let unlockCls = 'block mask'
        let info = { el: block }
        if (!b.hasClass('north') && $(`#${id - 20}`).attr('class') == unlockCls) {
            info.nearUnlock = $(`#${id - 20}`)
        }
        else if (!b.hasClass('west') && $(`#${id - 1}`).attr('class') == unlockCls) {
            info.nearUnlock = $(`#${id - 1}`)
        }
        else if (!b.hasClass('east') && $(`#${id * 1 + 1}`).attr('class') == unlockCls) {
            info.nearUnlock = $(`#${id * 1 + 1}`)
        }
        else if (!b.hasClass('south') && $(`#${id * 1 + 20}`).attr('class') == unlockCls) {
            info.nearUnlock = $(`#${id * 1 + 20}`)
        }
        return info
    }


    let triggerBlock = block => {
        let lastTime = localStorage.getItem('lastTime')
        let timeSpan = Date.now() - lastTime
        if (timeSpan > timelimit) {
            localStorage.setItem('lastTime', Date.now())
            block.trigger('click')
        }
        else {
            console.log('频率过快,延迟执行', timeSpan)
        }

    }

    let start = () => {
        if ($('.monster').not('.boss').length) {
            console.log('小怪')
            triggerBlock($('.monster').not('.boss'))
            setTimeout(start, timelimit)
            return
        }
        else if ($('.col-md-3 .panel-body p:last .physical').text() == 0) {
            let lastTime = localStorage.getItem('lastTime')
            let timeSpan = Date.now() - lastTime
            if (timeSpan > timelimit) {
                localStorage.setItem('lastTime', Date.now())
                console.log('重置')
                $("form").attr("action", "DungeonRefresh");
                $("form").trigger("submit");
            }
            setTimeout(start, timelimit)
            return
        }
        let blocks = $('.dungeon-container').find('.north,.west,.east,.south,.public')
        let nextBlock
        let nextMonster
        blocks.each((i, n) => {
            if (!nextBlock || !nextMonster) {
                let info = blockNearUnlock($(n))
                if (info.nearUnlock && info.nearUnlock.length) {
                    if (info.el.hasClass('monster')) {
                        //info.el.css('background','rgba(255,0,0,0.3)')
                        nextMonster = info.el
                    }
                    else {
                        //info.el.css('background','rgba(0,255,0,0.3)')
                        nextBlock = info.el
                    }
                }
            }
        })
        //console.log(nextBlock)
        if (nextMonster && !nextMonster.hasClass('boss')) {
            console.log('小怪')
            triggerBlock(nextMonster)
            setTimeout(start, timelimit)
        }
        else if (nextBlock) {
            console.log('探路')
            triggerBlock(nextBlock)
            setTimeout(start, timelimit)
        }
        else if (nextMonster) {
            console.log('boss')
            triggerBlock(nextMonster)
            setTimeout(start, timelimit)
        }
        else {
            console.log('boss-')
            triggerBlock($('.boss'))
            setTimeout(start, timelimit)
        }
        console.log('end-func')
    }

    start()
}

if (~location.href.indexOf('Equipment')) {
    console.log('加载装备页插件')
    plugSell($('.panel-inverse:eq(1)'))
    plugSell($('.panel-inverse:eq(2)'))
    plugStore($('.panel-inverse:eq(1)'))
}
if (~location.href.indexOf('Home') || location.pathname == '/') {
    //
    console.log('加载排序插件')
    plugOrderByName()
}
if (~location.href.indexOf('Map/Dungeon')) {
    console.log('自动打地牢')
    plugAutoDungeon()
}
if (~location.href.indexOf('InDungeon')) {
    console.log('战斗中')
    setInterval(() => {
        let lastTime = localStorage.getItem('lastTime')
        let timeSpan = Date.now() - lastTime
        if (timeSpan > timelimit) {
            localStorage.setItem('lastTime', Date.now())
            if ($('.turn:eq(0)').css('display') == 'block') {
                window.location.replace($('.pull-right .btn-default')[0].href)
            }
        }
    }, timelimit)
}

//<div class="notice-content"><span class="label label-success">竞标</span><span class="">[2018/4/14 23:24:06]</span>收到对装备<span class="unique equip-name">【海鸥】</span>的竞标，出价<span>+ <span class="lightning">10000</span>金币</span>，是否同意竞标? </div>


