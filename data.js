/* 初始行程数据（首次打开、或点“恢复默认”时使用；页面上的修改会存到共享库） */
window.SEED = {
  version: 1,
  meta: {
    title: '浪漫土耳其 · 四人旅游攻略',
    subtitle: '2026/09/26—10/03 · 伊斯坦布尔 → 费特希耶 → D400/卡什 → 安塔利亚 → 卡帕多奇亚',
    people: 4,
    rates: { try: 56, cny: 7.7 }
  },
  days: [
    {
      id: 'd1', tab: '9/26', date: '9月26日 周六', start: 630,
      title: '伊斯坦布尔｜大巴扎＋新城区＋日落游船',
      route: 'IST → 酒店寄存 → 大巴扎 → 塔克西姆 → 独立大街 → 加拉塔 → 码头',
      note: '大巴扎放在周六；游船班次以当天码头公告为准。',
      opts: {
        '主方案': [
          { name: 'IST抵达（CA859：预计07:15／计划08:00）→酒店', time: '08:00', dur: 90, travel: 0, type: 'transport', lat: 41.275, lng: 28.752, cost: 60, unit: '全车预算€', fixed: 1, desc: '北京T3 02:00出发；订单截图显示预计抵达07:15、计划抵达08:00，按当天航空公司信息和机场实际为准。' },
          { name: '酒店寄存行李', time: '10:30', dur: 30, travel: 10, type: 'hotel', lat: 41.009253, lng: 28.949279, fixed: 1, desc: '先寄存，不等正式入住。' },
          { name: '大巴扎', time: '11:00', dur: 90, travel: 15, type: 'spot', lat: 41.011, lng: 28.968, cost: 0, desc: '室内集市，免费；适合逛灯具、香料和纪念品。' },
          { name: '午餐', time: '12:45', dur: 60, travel: 10, type: 'food', lat: 41.011, lng: 28.967, desc: '在大巴扎外沿解决，避免为网红店排长队。' },
          { name: '塔克西姆广场', time: '14:00', dur: 45, travel: 30, type: 'spot', lat: 41.037, lng: 28.985, cost: 0, desc: '现代伊斯坦布尔城市广场，免费。' },
          { name: '独立大街', time: '14:45', dur: 90, travel: 5, type: 'spot', lat: 41.034, lng: 28.978, cost: 0, desc: '红色电车、街店和咖啡馆。' },
          { name: '加拉塔塔外观', time: '16:20', dur: 40, travel: 10, type: 'spot', lat: 41.026, lng: 28.974, cost: 0, desc: '只拍外观，不登顶。' },
          { name: '两小时日落博斯普鲁斯游船', time: '17:15', dur: 120, travel: 15, type: 'transport', lat: 41.026, lng: 28.974, cost: 34, unit: '每人预算€', desc: '选择返回同一码头的日落船。' },
          { name: '加拉塔桥拍照＋晚餐', time: '19:30', dur: 90, travel: 10, type: 'food', lat: 41.017, lng: 28.971, desc: '看金角湾、渔船和老城剪影。' },
          { name: '返回酒店', time: '21:10', dur: 35, travel: 0, type: 'hotel', lat: 41.009253, lng: 28.949279, fixed: 1, desc: '回酒店休息。' }
        ]
      }
    },
    {
      id: 'd2', tab: '9/27', date: '9月27日 周日', start: 450,
      title: '伊斯坦布尔｜蓝色清真寺＋圣索菲亚可选＋SAW',
      route: '酒店 → 蓝色清真寺 → 圣索菲亚 → 取行李 → SAW',
      note: '蓝色清真寺为活跃清真寺；上午参观，避开午间礼拜。',
      opts: {
        '主方案': [
          { name: '早餐＋退房寄存', time: '07:30', dur: 60, travel: 0, type: 'hotel', lat: 41.009253, lng: 28.949279, fixed: 1, desc: '行李寄存在酒店。' },
          { name: '蓝色清真寺', time: '08:30', dur: 50, travel: 10, type: 'spot', lat: 41.005, lng: 28.977, cost: 0, desc: '免费；注意服装、脱鞋和礼拜暂停。' },
          { name: '圣索菲亚（排队短才入内）', time: '09:30', dur: 70, travel: 10, type: 'spot', lat: 41.009, lng: 28.98, cost: 25, unit: '每人预算€', desc: '排队超过30分钟就只看外观。' },
          { name: '竞技场广场＋德国喷泉', time: '10:50', dur: 35, travel: 5, type: 'spot', lat: 41.006, lng: 28.976, cost: 0, desc: '蓝色清真寺旁的古罗马赛马场遗址，免费。' },
          { name: '取行李＋午餐', time: '11:40', dur: 100, travel: 15, type: 'food', lat: 41.009253, lng: 28.949279, fixed: 1, desc: '不再加入托普卡帕宫。' },
          { name: '前往SAW机场', time: '13:45', dur: 120, travel: 0, type: 'transport', lat: 40.899, lng: 29.309, cost: 60, unit: '全车预算€', fixed: 1, desc: '推荐预约接送/出租车。' },
          { name: 'VF3126｜SAW→达拉曼', time: '19:35', dur: 80, travel: 0, type: 'transport', lat: 40.899, lng: 29.309, fixed: 1, desc: '订单显示计划抵达20:55；以航空公司当天信息为准。' },
          { name: '达拉曼机场→酒店', time: '20:55', dur: 90, travel: 0, type: 'hotel', lat: 36.54933, lng: 29.115, fixed: 1, desc: '预约接送到费特希耶/厄吕代尼兹住宿。' }
        ]
      }
    },
    {
      id: 'd3', tab: '9/28', date: '9月28日 周一', start: 510,
      title: '费特希耶｜12岛跳岛游',
      route: '酒店 → 费特希耶港 → 4—5个海湾停留 → 港口 → 酒店',
      note: '这天不塞其他陆地景点，重点是下海、船上午餐和休息。',
      opts: {
        '主方案': [
          { name: '前往费特希耶港', time: '09:15', dur: 75, travel: 0, type: 'transport', lat: 36.621, lng: 29.115, cost: 30, unit: '每人预算€', fixed: 1, desc: '选择含酒店接送的船票。' },
          { name: '12岛跳岛游', time: '10:30', dur: 420, travel: 0, type: 'transport', lat: 36.621, lng: 29.115, cost: 30, unit: '每人预算€', desc: '常见停靠：Yassıca、Tersane、Rabbit、Red Island、Aquarium Bay；通常船上午餐。' },
          { name: '回酒店＋晚餐', time: '17:30', dur: 120, travel: 0, type: 'food', lat: 36.54933, lng: 29.115, desc: '回酒店洗澡休息，再在海边吃晚餐。' }
        ]
      }
    },
    {
      id: 'd4', tab: '9/29', date: '9月29日 周二', start: 450,
      title: 'D400｜费特希耶→卡什→安塔利亚',
      route: '酒店 → 卡尔坎 → 卡普塔什 → 卡什 → 德姆雷/芬尼凯 → 安塔利亚',
      note: '建议7座商务车；不再临时加入萨克利肯特、帕塔拉或Kekova。',
      opts: {
        '主方案': [
          { name: '酒店出发＋商务车接人', time: '07:30', dur: 30, travel: 0, type: 'transport', lat: 36.54933, lng: 29.115, cost: 320, unit: '全车预算€', fixed: 1, desc: '确认停车、高速和等待费用。' },
          { name: '卡尔坎短停', time: '10:30', dur: 35, travel: 150, type: 'spot', lat: 36.266, lng: 29.414, cost: 0, desc: '海边小镇，咖啡和拍照。' },
          { name: '卡普塔什观景台', time: '11:20', dur: 35, travel: 15, type: 'spot', lat: 36.229, lng: 29.448, cost: 0, desc: '只拍照约30分钟；下海需增加约1小时。' },
          { name: '卡什午餐＋港口＋古剧场', time: '12:10', dur: 120, travel: 30, type: 'food', lat: 36.201, lng: 29.638, desc: 'D400当天最重要的停留点。' },
          { name: '德姆雷/芬尼凯休息', time: '16:00', dur: 30, travel: 145, type: 'spot', lat: 36.26, lng: 30.05, cost: 0, desc: '补水和休息，不临时进古城。' },
          { name: '抵达安塔利亚酒店', time: '19:00', dur: 30, travel: 150, type: 'hotel', lat: 36.88439, lng: 30.7066, fixed: 1, desc: '入住后在卡莱伊奇晚餐。' }
        ]
      }
    },
    {
      id: 'd5', tab: '9/30', date: '9月30日 周三', start: 510,
      title: '安塔利亚｜卡莱伊奇＋飞卡帕多奇亚',
      route: '酒店 → 卡莱伊奇 → 哈德良门 → 罗马港 → AYT → ASR → 格雷梅',
      note: '只在老城内活动，不去远距离瀑布。',
      opts: {
        '主方案': [
          { name: '早餐', time: '08:30', dur: 60, travel: 0, type: 'food', lat: 36.88439, lng: 30.7066, desc: '酒店附近解决。' },
          { name: '卡莱伊奇老城', time: '09:30', dur: 80, travel: 5, type: 'spot', lat: 36.88439, lng: 30.7066, cost: 0, desc: '石板路、老房子、咖啡馆和海边小巷，免费。' },
          { name: '哈德良门', time: '10:55', dur: 30, travel: 10, type: 'spot', lat: 36.885, lng: 30.713, cost: 0, desc: '古罗马城市入口，免费。' },
          { name: '罗马港＋午餐', time: '11:35', dur: 90, travel: 10, type: 'food', lat: 36.884, lng: 30.704, desc: '看港口和地中海海景。' },
          { name: '取行李→AYT机场', time: '13:30', dur: 90, travel: 10, type: 'transport', lat: 36.899, lng: 30.801, cost: 20, unit: '全车预算€', fixed: 1, desc: '提前叫车。' },
          { name: 'PC4156｜AYT→ASR', time: '16:00', dur: 70, travel: 0, type: 'transport', lat: 38.77, lng: 35.495, fixed: 1, desc: '航班固定节点。' },
          { name: 'ASR→格雷梅接送', time: '17:10', dur: 100, travel: 0, type: 'transport', lat: 38.77, lng: 35.495, cost: 15, unit: '每人预算€', fixed: 1, desc: '按航班号预订共享接送。' },
          { name: '入住酒店', time: '20:00', dur: 30, travel: 0, type: 'hotel', lat: 38.64143, lng: 34.828757, fixed: 1, desc: '简单吃饭休息。' }
        ]
      }
    },
    {
      id: 'd6', tab: '10/1', date: '10月1日 周四', start: 300,
      title: '卡帕多奇亚｜热气球＋洞穴教堂＋日落',
      route: '酒店 → 热气球 → 休息 → 格雷梅露天博物馆 → 红/玫瑰谷',
      note: '热气球按当天SHM许可；取消时切换备选方案。',
      opts: {
        '主方案': [
          { name: '热气球', time: '05:00', dur: 210, travel: 0, type: 'transport', lat: 38.642, lng: 34.827, cost: 240, unit: '每人预算€', fixed: 1, desc: '天气敏感；确认取消退款/改期。' },
          { name: '早餐＋补觉', time: '08:30', dur: 150, travel: 0, type: 'hotel', lat: 38.64143, lng: 34.828757, fixed: 1, desc: '不要接着参加完整一日团。' },
          { name: '午餐', time: '11:30', dur: 60, travel: 15, type: 'food', lat: 38.642, lng: 34.827, desc: '格雷梅中心顺路用餐。' },
          { name: '格雷梅露天博物馆', time: '13:00', dur: 120, travel: 15, type: 'spot', lat: 38.643, lng: 34.846, cost: 20, unit: '每人预算€', desc: '岩窟教堂、修道院和壁画。' },
          { name: '红谷/玫瑰谷短线', time: '15:30', dur: 70, travel: 20, type: 'spot', lat: 38.634, lng: 34.838, cost: 0, desc: '只走观景短线。' },
          { name: '红谷日落＋晚餐', time: '17:00', dur: 120, travel: 10, type: 'food', lat: 38.627, lng: 34.846, desc: '日落后回格雷梅。' },
          { name: '返回酒店', time: '19:10', dur: 30, travel: 0, type: 'hotel', lat: 38.64143, lng: 34.828757, fixed: 1, desc: '回酒店休息。' }
        ],
        '热气球取消': [
          { name: '睡到自然醒＋早餐', time: '08:30', dur: 120, travel: 0, type: 'hotel', lat: 38.64143, lng: 34.828757, fixed: 1, desc: '先休息。' },
          { name: '格雷梅露天博物馆', time: '11:00', dur: 120, travel: 15, type: 'spot', lat: 38.643, lng: 34.846, cost: 20, unit: '每人预算€', desc: '核心文化景点。' },
          { name: '午餐＋咖啡', time: '13:15', dur: 90, travel: 15, type: 'food', lat: 38.642, lng: 34.827, desc: '观察天气。' },
          { name: '红谷/玫瑰谷短线', time: '15:00', dur: 80, travel: 20, type: 'spot', lat: 38.634, lng: 34.838, cost: 0, desc: '天气差就删掉。' },
          { name: '乌奇萨尔日落备选', time: '17:00', dur: 90, travel: 20, type: 'spot', lat: 38.63, lng: 34.799, cost: 0, desc: '根据10/2补飞决定是否保留。' }
        ]
      }
    },
    {
      id: 'd7', tab: '10/2', date: '10月2日 周五', start: 480,
      title: '卡帕多奇亚｜轻松北线＋飞回伊斯坦布尔',
      route: '酒店寄存 → 乌奇萨尔 → 鸽子谷 → 阿瓦诺斯 → 帕夏巴格 → 代夫兰特 → ASR',
      note: '默认轻松北线；也可切换绿线备选。',
      opts: {
        '轻松北线': [
          { name: '早餐＋退房寄存', time: '08:00', dur: 90, travel: 0, type: 'hotel', lat: 38.644315, lng: 34.830193, fixed: 1, desc: '行李寄存在酒店。' },
          { name: '乌奇萨尔观景台', time: '09:30', dur: 60, travel: 20, type: 'spot', lat: 38.63, lng: 34.799, cost: 0, desc: '岩石城堡和全景。' },
          { name: '鸽子谷', time: '10:40', dur: 50, travel: 10, type: 'spot', lat: 38.634, lng: 34.807, cost: 0, desc: '与乌奇萨尔很近，同一段路线连续游玩。' },
          { name: '阿瓦诺斯午餐＋陶艺', time: '12:00', dur: 120, travel: 25, type: 'food', lat: 38.715, lng: 34.847, desc: '陶艺小镇。' },
          { name: '帕夏巴格', time: '14:20', dur: 60, travel: 25, type: 'spot', lat: 38.679, lng: 34.852, cost: 0, desc: '精灵烟囱岩柱。' },
          { name: '代夫兰特谷', time: '15:30', dur: 45, travel: 10, type: 'spot', lat: 38.673, lng: 34.866, cost: 0, desc: '动物形状岩石。' },
          { name: '取行李＋提前晚餐', time: '16:45', dur: 75, travel: 25, type: 'food', lat: 38.644315, lng: 34.830193, fixed: 1, desc: '尽量17:30前离开。' },
          { name: '前往ASR机场', time: '18:00', dur: 100, travel: 0, type: 'transport', lat: 38.77, lng: 35.495, cost: 15, unit: '每人预算€', fixed: 1, desc: '提前订送机。' },
          { name: 'TK2091｜ASR→IST', time: '22:50', dur: 85, travel: 0, type: 'transport', lat: 38.77, lng: 35.495, fixed: 1, desc: '航班固定节点。' }
        ],
        '绿线备选': [
          { name: '早餐＋退房寄存', time: '07:30', dur: 60, travel: 0, type: 'hotel', lat: 38.644315, lng: 34.830193, fixed: 1, desc: '行李寄存。' },
          { name: '地下城', time: '08:30', dur: 75, travel: 45, type: 'spot', lat: 38.373, lng: 34.734, cost: 25, unit: '每人预算€', desc: '多层地下空间，部分通道狭窄。' },
          { name: '伊赫拉拉峡谷短线', time: '10:30', dur: 120, travel: 40, type: 'spot', lat: 38.251, lng: 34.305, cost: 0, desc: '溪流峡谷，步行量较大。' },
          { name: '塞利梅修道院', time: '13:10', dur: 60, travel: 30, type: 'spot', lat: 38.257, lng: 34.305, cost: 0, desc: '岩窟修道院。' },
          { name: '午餐＋回格雷梅', time: '14:30', dur: 120, travel: 150, type: 'food', lat: 38.642, lng: 34.827, desc: '必须确认17:00前返回。' },
          { name: '取行李→ASR机场', time: '17:00', dur: 100, travel: 0, type: 'transport', lat: 38.77, lng: 35.495, cost: 15, unit: '每人预算€', fixed: 1, desc: '绿线延误就放弃剩余点。' },
          { name: 'TK2091｜ASR→IST', time: '22:50', dur: 85, travel: 0, type: 'transport', lat: 38.77, lng: 35.495, fixed: 1, desc: '航班固定节点。' }
        ]
      }
    },
    {
      id: 'd8', tab: '10/3', date: '10月3日 周六', start: 540,
      title: '机场休息＋返程',
      route: '酒店 → IST → 北京',
      note: '不进市区，保留国际航班缓冲。',
      opts: {
        '主方案': [
          { name: '早餐＋小镇闲逛', time: '09:00', dur: 120, travel: 0, type: 'hotel', lat: 41.192627, lng: 28.732381, fixed: 1, desc: '睡够再出发。' },
          { name: '前往IST机场', time: '11:30', dur: 45, travel: 0, type: 'transport', lat: 41.275, lng: 28.752, cost: 10, unit: '全车预算€', fixed: 1, desc: '酒店到机场。' },
          { name: 'CA860｜IST→北京', time: '14:55', dur: 865, travel: 0, type: 'transport', lat: 41.275, lng: 28.752, fixed: 1, desc: '订单截图显示预计抵达04:33、计划抵达05:20（次日）；以航空公司当天信息为准。' }
        ]
      }
    }
  ],
  alternatives: {
    d1: [['香料市场', '埃及香料、坚果和伴手礼集市', 41.016, 28.97], ['圣索菲亚', '排队短时可入内参观', 41.009, 28.98], ['地下水宫', '地下蓄水池，适合雨天', 41.008, 28.977], ['苏莱曼尼耶清真寺', '老城高处全景和清真寺庭院', 41.016, 28.964]],
    d2: [['地下水宫', '室内地下蓄水池，适合短时间参观', 41.008, 28.977], ['大巴扎', '周日通常关闭，不建议安排', 41.011, 28.968], ['托普卡帕宫', '宫殿与帝国收藏，时间充足才去', 41.011, 28.984], ['古尔哈内公园', '老城内的绿地，适合散步休息', 41.013, 28.981]],
    d3: [['厄吕代尼兹', '蓝色泻湖和海滩，建议另留半天', 36.549, 29.115], ['蝴蝶谷', '海湾和步道，与跳岛游性质相近', 36.5, 29.124], ['费特希耶鱼市', '晚餐和海鲜小店集中', 36.621, 29.116], ['Kayaköy希腊村', '山谷中的废弃石屋村落', 36.576, 29.082]],
    d4: [['卡尔坎老城', '海边小镇，适合咖啡和拍照', 36.266, 29.414], ['帕塔拉古城', '热门古城，但会明显拉长当天车程', 36.264, 29.313], ['Kekova沉船城', '需单独半天至一天出海', 36.185, 29.845], ['萨克利肯特峡谷', '需要额外往返，不建议硬塞进D400', 36.452, 29.4]],
    d5: [['杜顿瀑布', '安塔利亚海岸瀑布，需额外往返', 36.834, 30.787], ['安塔利亚考古博物馆', '室内博物馆，适合早到时加入', 36.889, 30.696], ['海湾观景台', '卡莱伊奇外沿海景，免费', 36.884, 30.704]],
    d6: [['乌奇萨尔', '岩石城堡和全景，可替代红谷', 38.63, 34.799], ['阿瓦诺斯', '陶艺小镇，适合天气不佳时', 38.715, 34.847], ['爱情谷', '奇岩地貌和轻徒步', 38.659, 34.846], ['泽尔维露天博物馆', '洞穴聚落，适合替代露天博物馆', 38.675, 34.854]],
    d7: [['地下城', '南线历史景点，通道较狭窄', 38.373, 34.734], ['伊赫拉拉峡谷', '需要徒步，体力和天气好再加入', 38.251, 34.305], ['塞利梅修道院', '岩窟修道院，和峡谷同方向', 38.257, 34.305], ['代林库尤地下城', '规模更大但路程更远', 38.375, 34.734]]
  }
};
