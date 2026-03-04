<script setup>
import { onMounted, nextTick } from 'vue';
import * as live2d from 'live2d-render';


onMounted(async () => {
    // 初始化 live2d
    await live2d.initializeLive2D({
        // live2d 所在区域的背景颜色
        BackgroundRGBA: [0.0, 0.0, 0.0, 0.0],

        // live2d 的 model3.json 文件的相对路径
        ResourcesPath: 'whitecatfree_vts/sdwhite cat free.model3.json',

        // live2d 的大小
        CanvasSize: {
            height: 500,
            width: 400
        },
        
        // 展示工具箱（可以控制 live2d 的展出隐藏，使用特定表情）
        ShowToolBox: true,

        // 是否使用 indexDB 进行缓存优化，这样下一次载入就不会再发起网络请求了
        LoadFromCache: true
    });

    console.log('finish loading');
    // 使用 nextTick 确保 DOM 渲染完成后再调用
    nextTick(() => {
      live2d.setMessageBox("欢迎来到在线音乐创作和分享平台，在这里请尽情创作和交流", 3000);  // 3000 表示消息框显示 3 秒
      live2d.setRandomExpression();
    });
});
</script>
<style>
#live2dMessageBox-content {
    background-color: #FF95BC;
    color: white;
    font-family: var(--base-font);
    padding: 10px;
    height: fit-content;
    border-radius: .7em;
    word-break: break-all;
    border-right: 1px solid transparent;
}

.live2dMessageBox-content-hidden {
    opacity: 0;
    transform: scaleY(0.2);
    transition: all 0.35s ease-in;
    -moz-transition: all 0.35s ease-in;
    -webkit-transition: all 0.35s ease-in;
}

.live2dMessageBox-content-visible {
    opacity: 1;
    transition: all 0.35s ease-out;
    -moz-transition: all 0.35s ease-out;
    -webkit-transition: all 0.35s ease-out;
}

</style>
