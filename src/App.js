import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';
import './css/App.css'
import html2canvas from 'html2canvas';

import { FormLayout, Snackbar, Select, Input, Div, Panel, Title, Headline, View, FixedLayout, Button, ScreenSpinner, platform, ANDROID, Alert } from '@vkontakte/vkui';

import Icon28StoryOutline from '@vkontakte/icons/dist/28/story_outline';
import Icon24ImageFilterOutline from '@vkontakte/icons/dist/24/image_filter_outline';

import skull1 from './img/skull1.svg';
import skull2 from './img/skull2.svg';
import skull3 from './img/skull3.svg';
import skull4 from './img/skull4.svg'
import downwards_black_arrow from './img/downwards-black-arrow.png';
import story_bg from './img/story-bg.jpg';

import bgDark from './img/bg.jpg';
import bgText from './img/text.png';

const request = require('request');

let group_id = 200243650,
	app_id = 7551802,
	need_sub_group = false,
	need_sub_msg = true;

const os = platform();

class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			popout: null,
			activePanel: 'form',
			time: '',
			screen: false,
			scheme: 'bright_light',
			paralel: false,
		};

		this.componentDidMount = this.componentDidMount.bind(this);
		this.initializeApp = this.initializeApp.bind(this);
		this.initializeTimer = this.initializeTimer.bind(this);
		this.go = this.go.bind(this);
		this.generateRandomTime = this.generateRandomTime.bind(this);
		this.updateTime = this.updateTime.bind(this);
		this.share = this.share.bind(this);
	}

	async componentDidMount () {
		bridge.subscribe(async ({ detail: { type, data }}) => {
			if(type !== undefined) console.log(type, data);
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = false ? data.scheme ? data.scheme : 'bright_light' : 'space_gray';
				document.body.attributes.setNamedItem(schemeAttribute);
				this.setState({ scheme: schemeAttribute.value });
				if(bridge.supports('VKWebAppSetViewSettings')){
					bridge.send('VKWebAppSetViewSettings', {status_bar_style: 'dark', action_bar_color: 'none'});
				}
			}else if (type === 'VKWebAppViewRestore') {
				this.setState({ popout: null, screen: false });
				let shapes = document.getElementsByClassName('bg_shape_container');
				for(let element of shapes){
					try{
						console.log('delete', element);
						element.remove();
					}catch (e) {
						console.error(e);
					}
				}
			}
		});

		this.initializeApp();
	}

	async initializeApp() {
		try{
			let sValues = await bridge.sendPromise('VKWebAppStorageGet', {keys: ['_________date1', '_________date2', '_________reason1', '_________reason2']});
			sValues = sValues.keys;
			let data = {};
			try{
				for(let value of sValues){
					data[value.key] = Number(value.value);
				}
			}catch (e) {
				console.error('e3', e)
			}
			this.setState({ data, sValues });

			if(data._________date2 !== false && data._________date2 !== 0){
				await this.initializeTimer();
				this.go('main');
			}
		}catch (e) {}

        await bridge.send('VKWebAppInit');

		let response = await this.get('users.create', { app_id });
	}

	async initializeTimer() {
		let imgs = [skull1,
			skull2,
			skull3,
			skull4];
		/*
		setInterval(()=>{
			try{
				let shape_container = document.createElement('div');
				shape_container.className = 'bg_shape_container';
				let shape = document.createElement('img');
				shape.crossOrigin = 'anonymous';
				shape.className = 'bg_shape light_outline';
				shape.src = imgs[this.random(0, imgs.length)];
				shape.style.left = (this.random(-15, 90)) + 'vw';
				shape_container.appendChild(shape);
				document.getElementById('bg_shapes').appendChild(shape_container);
				for(let i = 0; i < 5; i++){
					shape.style.setProperty('--offset-x-' + i, this.random(-20, 20) +'vw');
				}
				setTimeout(()=>{
					try{
						shape_container.remove();
					}catch (e) {}
				}, 10000);
			}catch (e) {}
		}, 600);
		*/
		let generated = await this.generateRandomTime(false);
		await this.sleep(500);
		this.updateTime();
		await this.sleep(500);
		return true;
	}

	async generateRandomTime(isParalel){
		let reasons = [ ', упав в канализационный люк во время грозы, после перелома позвоночника я захлебнусь от потоков дождевой воды',
			' во время митинга, случайно брошенный камень пробьет мне череп и меня просто не успеют довезти до больницы, так как дороги будут перекрыты',
			' из-за ошибки инструктора, который неправильно уложит стропы моего парашюта',
			' при подъеме на эскалаторе. Резко провалившиеся ступени утянут меня за собой и мои кости перемолет шестернями механизма',
			', поскользнувшись на велодорожке и ударившись о мусорное ведро, которое перебьет мне сонную артерию',
			' от рака яичек',
			' под колесами трамвая, перебегая дорогу и споткнувшись о рельсу',
			' от угарного газа во время пожара в старом заброшенном доме',
			' за рулем каршеринга в состоянии алкогольного опьянения',
			' в результате падения с крыши дачного дома, ремонтируя старую кровлю',
			', пытаясь перелезть забор, запутавшись горлом в колючей проволоке',
			', переплывая водохранилище. Меня утянет на дно водоворотом',
			' в результате укуса клеща, который занесет неизвестную инфекцию',
			' от укуса пчелы, не зная, что у меня была аллергия на их яд',
			' во время футбольного матча, на меня и головы фанатов обвалится кровля стадиона',
			' от удара молнией в мой зонт во время грозы',
			' от сердечного приступа на американских горках',
			' в результате разбойного нападения. От выстрела в бедро я истеку кровью до приезда врачей',
			' в результате прыжка с крыши дома в бассейн, ударившись о бортик головой я потеряю сознание и захлебнусь',
			' во время полета на дельтаплане, оторвавшиеся крепления отсоединят одно из сидений и я рухну на землю',
			' вылетев через отбойники с автострады в результате неудачного обгона',
			' на пешеходном переходе во время грозы, меня придавит рухнувшим светофором',
			' во время спуска со склона, случайно споткнувшись о корень дерева, пролечу 20 метров с переломанной шеей',
			' в резьтате брошенной в мою голову бутылки из окна чей-то квартиры',
			' внутри лифта жилого дома, рухнув с 7-го этажа после обрыва троса',
			' из-за многочисленых переломов в строительном магазине под завалившимися на меня стеллажами с краской',
			' в результате аварии, вылетев через лобовое стекло автомобиля и сломаю шею о бетонный блок',
			', сорвавшись с крыши здания, когда буду делать красивый снимок для инстаграма',
			' от парациантилофилклиникта',
			' от инстивиальной парошемии головного мозга',
			' во время урока химии, случайно загоревшись от газовой горелки',
			' во время правления Путина',
			' от укуса бешеной собаки, так как поздно обращусь в больницу',
			' из-за сорвавшегося домкрата и мне раздавит грудную клетку машиной',
			' на производстве, утянувшая мою куртку церкулярная пила распилит меня на две части',
			' в потасовке около клуба в результате перелома носа произойдет кровоизлияние в мозг',
			' во время взрыва неисправного газового котла',
			' потери крови в результате нападения своры дворовых собак',
			' из-за толпы в метро, случайно сорвавшись с платформы под несущийся поезд',
			' на охоте от случайного выстрела в грудь при встрече с другими охотниками',
			' во время пранка, друзья позовут меня на стрелку, а сами не прийдут, в итоге меня одного изобьют досмерти',
			' во время лучшего минета в жизни от яичного приступа',
			' от голода в лесу, случайно попав в медвежий капкан на охоте',
			' во время 3й мировой войны от радиоактивного излучения',
			' из-за запавшего языка, проснувшись, я задохнусь не сумев вытащить его наружу',
			' от разрыва легких, во время падения со скутера',
			' в открытом море, заснув на надувном матрасе',
			' во время урагана. Ветер завалит рекламный щит и раздавит мои органы в кашу',
			' в ДТП. Ноги зажмет искареженным металлом автомобиля и я потеряю слишком много крови',
			' от истеричного приступа смеха, после того как моего друга пристыдит учительница за то, что он дрочил в школьном туалете.' +
			' во время спец операции по захвату террористов в кс го.',
			', упав с высоты 15 метров в Петербурге, во время экскурсии по крыше.',
			' от болевого шока неправильно прыгнув с моста в воду.',
			', решив прокатиться пьяным с друзьями на папиной машине. Я не справлюсь с управлением и влечу в другую машину.',
			' от удара молнией шока. Моё тело получит 86% ожогов и от болевого шока моё сердце остановится.',
			' от пулевого ранения, заступившись за девушку, которую хотят ограбить.',
			' на Русской свадьбе. Меня возьмут на понт, что я не смогу выпить больше водки, чем жених. Я скончаюсь от алкогольного опьянения так и не выяснив кто выпил больше водки.',
			' во время секса. Мы с партнером решим разнообразить секс и слишком сильно затянутые верёвки вокруг моей шеи меня придушат.',
			' во время драки, после сильного удара я упаду на бордюр и разобью себе голову.',
			' в озере. Сильно напившись поспорю что переплыву озеро, но примерно на середине мои силы иссякнут и я утону.',
			' от сосулечно-парапседальной детерменизационной аклиматизации головного мозга.',
			', утонув в бассейне. Подскользнувшись на мокрой после дождя плитке, ударюсь затылком и свалюсь в воду, потеряв сознание',
			' во время пробежки. Не заметив ремонт впереди себя, я налечу глазом на торчащую арматуру. Проткнув глазное яблоко, я умру от кровоизлеяния в мозг.',
			' от увечий, нанесённых мне лошадью. На конной прогулке я неаккуратно подойду к нервной лошади и она легнет меня задним ногами в шею. От удара произойдёт разрыв гортани и артерии.',
			' от укуса Кенийской Лидрарии, на которую окажется у меня будет аллергия. Отёк гортани быстро лишит меня воздуха и я умру в страшных муках.',
			' в результате вдоха химических паров неизвестного мне вещества. Химический ожог растворит лёгкие и я захлебнусь кровавой кашей из своих органов.',
			' в результате обвала кровли кинотеатра. Тежелая аппаратура и некачественная работа строителей утянут металлические балки на людей в зале. Мне проломит череп, сломает шею и я умру мгновенно.',
			', ожидая автобус на остановке. Заснувший водитель газели не справится с управлением и снесёт остановку вместе с ожидавшими транспорта людьми.',
			' во время пожара на концерте. Огонь сделает толпу безумным стадом, я споткнусь и люди меня затопчут, переломая все кости.',
			' во время подъёма на гору во время экскурсии. Зазевавшись, промохнусь ногой мимо уступа и сорвусь с высокого склона. Скорая не успеет приехать и я истеку кровью.',
			' под колёсами погрузчика. Работник в продуктовом магазине будет ехать с ящиками овощей, не заметит меня и подомнет под колеса тяжёлой машины.',

			' от рук своих одноклассников, они захотят подшутить надо мной и толкнут меня с лестницы, во время падения я сломаю шею. Одноклассников никто не накажет.',
			' на вечеринке, когда меня отравит моя бывшая. Она так и не отошла от того что я ее бросил.',
			' когда буду спасать ребенка из пожара. Он выживет, а вот я уже не смогу выбраться.',
			' 13 декабря, будет гололёд. Случайно поскользнувшись я попаду под машину.',
			' во время похода, на меня нападет волк и скормит меня своим детёнышам.',
			' из-за прививки от COVID-19, она вызовет аллергическую реакцию, после чего у меня будет отек легких.',
			' потому что выпил стакан с ядом который предназначался моему начальнику.',
			' подвернув ногу и упав в канализацию, я не смогу передвигаться и меня заживо будут поедать крысы.',
			' в своей ванной, когда случайно усну в ней и задохнусь.',
			' от рук своего сына, он возьмет мой пистолет и выстрелит в меня, потому что подумал что он игрушечный.',
			' потому что забуду пожелать своей девушке спокойной ночи и она вынесет мне мозг.',
			' из-за укуса неизвестного науке насекомого, мое тело будет покрыто волдырями и вскоре у меня случится сердечный приступ.',
			' из-за того что моя собака загрызет меня до смерти, у нее было бешенство.',
			' в авиакатастрофе, группа террористов будут держать нас в заложниках, когда ситуация будет неконтролируемой, они подорвут самолет.',
			' потому что врач поставит мне неверный диагноз, а когда это вскроется будет уже поздно.',
			' из-за засоса который поставит мне моя девушка, сосуды разорвутся и образуются тромбы, после случится кровоизлияние в мозг.',
			' от рук киллера, так как после смерти своего дедушки его наследство получу я, а мои родственники этого не захотят.',
			' в кинотеатре, начнется пожар, двери будут закрыты. Я и еще 23 человека задохнуться в зале.',
			' во время теракта, когда террористы попытаются убить маленького ребенка, я дам им отпор, и из-за этого получу пулю в лоб.',
			' на операционном столе, врач допустит смертельную ошибку когда будет меня оперировать. Он останется невиновным.',
			' во время своего циркового выступления, когда моя страховка слетит и я упаду с большой высоты.',
			' потому что подавлюсь конфетой, которую я своровал в магазине.',
			' от ожирения потому что моя бабушка меня перекормит пирожками.',
			' после того как послушаю новый трек Моргенштерна и Элджея.',
			' попав в аварию, после того как моя машина вылетит с моста и попадет в реку, двери будут заблокированы. Я задохнусь',
			' когда буду делать обход ночью на работе, зайдя в холодильник дверь захлопнется. К утру я замерзну насмерть.',
			' на приеме у парикмахера, она случайно проведет бритвой по моей шее.',
			' во сне, мой кот случайно разобьет градусник и к утру я буду мертв.',
			' в океанариуме, когда случайно упаду в бассейн с акулой.',
			' во время телефонного разговора, мой телефон будет неисправен и когда я буду беседовать с подругой он взорвется.',
			' во время секса, когда в комнату зайдет отец моей девушки.',
			' когда мы с друзьями захотим сфоткаться на крыше. Подует сильный ветер и я упаду вниз.',
			' из-за падения метеорита, меня не успеют довести то больницы.',
			' от рук маньяка, который будет держать меня в заточении неделю, а потом сделает себе на ужин.',
			' потому что забуду постирать грязные носки и задохнусь в первые минуты у себя в комнате.',
			' потому что мне на голову упадет часть балкона моей соседки.',
			' от приступа эпилепсии, потому что мне никто не сможет вовремя помочь.',
			' в Макдональдсе. Когда мне принесут десерт, я не замечу что там были орехи на которые у меня аллергия. Меня не успеют довезти до больницы.',
			' в своем новом доме, когда я буду стоять по центру комнаты. Люстра упадет на меня и проломит мне шею.',
			' на шашлыках, когда пьяный наступлю на костер и загорюсь.',
			' из-за того что моя бывшая наведет на меня порчу.',
			' заразившись СПИДом от иглы на которую случайно наступлю.',
			' с простреленной головой на охоте, потому что мой напарник перепутает меня с оленем.',
			' от химического отравления, на уроке химии я на спор выпью хим. раствор не подозревая что это цианистый калий.',
			' на руках своей подруги, потому что она придушит меня когда узнает что я встречаюсь с ее бывшим.',
			' на трассе, когда я буду идти в наушниках в телефоне я не услышу звук приближающийся машины.',
			' в драке с человеком который пытался украсть ��ой кошелек, пока я отвернусь он незаметно ударит меня по голове камнем и я замертво упаду.',
			' у бабушки в деревне, я буду идти рядом с загоном где свиньи, после того как я поскользнусь и упаду туда, я буду заживо съеден.',
			' когда буду прыгать с парашютом, он не успеет раскрыться.',
			' от неизвестной миру болезни, которую подхвачу во время путешествия по Китаю.',
			' в горах, нас накроет снежная лавина. Спасатели буду скоро, но они все равно не успеют.',
			' из-за того что какой-то псих схватит меня, после чего приведет к себе домой и сделает из меня мясной пирог.',
			' нелепой смертью, на меня упадет старое высохшее дерево.',
			' потому что узнаю секрет мирового правительства, на меня закажут киллера и на утро я буду мертв.',
			' когда буду выполнять каскадерский трюк, неудачно упав я сверну себе шею.',
			' из-за высокого перенапряжения, из-за сильного ветра электрические провода сорвутся и упадут прямо на меня.',
			' от рук местного педофила, которого недавно выпустили на свободу.',
			' случайно, провалившись в канализационный люк потому что не замечу его из-за телефона.',
			' на необитаемом острове от старости.',
			' во время ограбления банка, преступники не буду церемонится и сразу меня убьют.',
			' в путешествии на Австралия, где меня ночью пока я буду спать укусит ядовитый паук.',
			' во время аварии на АЭС, радиация сожжет мое тело.',
			' в парке когда попытаюсь разнять двух дерущихся людей, один из них достанет складной нож и в момент меня им зарежет.',
			' на колесе обозрения, когда несколько кабинок в том числе и моя, открепится и полетят.',
			' после того как меня похоронят заживо.',
			' во время спортивной тренировки, когда я буду делать упражнение, тренажёр внезапно сломается и придавит меня. Тем самым отрезав путь к воздуху.',
			' во врем�� починки автомобиля, случайно толкнув домкрат он расслабится и машина размажет мое лицо по земле.',
			' во время бурной ночи с двумя девушками, мое сердце не выдержит такого напряжения и у меня случится инсульт.',
			' когда буду ходить во сне. Случайно упав на отвертку которая пройдет сквозь мое горло.',
			' по своей глупости, когда перепутаю свои таблетки. И выпью те которые мне противопоказанны.',
			' после того как решу сделать операцию по удалению аппендицита в живую самостоятельно.',
			' в результате заражения крови, после укуса тропического малярийного комара.',
			' из-за куриной кости, которой случайно подавлюсь и она застрянет у меня в горле.',
			' после того как отыграю 50 часов без остановки в Fortnite.',
			' потому что мой таксист оказался насильником, это будет моя последняя поездка.',
			' после того как пойду на забив. Из-за того что парни из школы постоянно обижали мою младшую сестру.',
			' когда решу что искупаться зимой в проруби хорошая идея, но меня снесет течением и я не смогу выбраться.',
			' когда буду прыгать с тарзанки высотой 350м, жаль что трос забыли закрепить.',
			' из-за того что забуду выключить газ и лягу спать.',
			' когда куплю электронную сигарету, из-за того что она сильно грелась я подорву свое лицо.',
			' в результате крушения самолета, последними моими словами будет: «Смотри! Звезда падает. Загадывай желание»',
			' потому что заведу себе паука как «домашнее животное», это будет плохой идеей лечь с ним спать.',
			' когда случайно вместо конфет съем крысиную отраву. Мне хватит 3х минут чтобы понять что произойдет.',
			' когда мы с моей девушкой решим разнообразить нашу половую жизнь.',
			' после того как мой друг разыграет меня своей смертью, я побегу звать на помощь. После того как я побегу звать на помощь и начну спускаться по лестнице, он крикнет мне что это была шутка. У меня случится обморок и после падения с лестницы моя шея будет свернута.',
			' когда один из моих одноклассников возьмет нас в заложники на уроке потому что над ним все издевались. Я буду застрелен первым, т.к я постоянно его задирал.',
			' потому что меня собьет машина, из-за того что я шла в наушниках и не заметила что перехожу дорогу на красный свет.',
			' из-за ишемической болезни сердца вызванной физической и эмоциональной нагрузкой.',
			' из-за шутки в сторону афроамериканца, они воспримут ее как оскорбление, и я буду забит до смерти.',
			' из-за того что мой глупый друг случайно решит подшутить надо мной и подсыпет мне что-то в бокал.',
			' из-за неудачного пирсинга, мастер забудет помыть иголки и у меня будет заражении крови.',
			' когда сделаю каминг-аут. Мои одноклассники подкараулят меня после школы и будут издеваться надо мной до смерти.',
			' в лифте. Когда буду подниматься на 23 этаж. Тросы будут неисправны и лифт полетит вниз вместе со мной. Еще несколько минут я буду жив.',
			' во время соревнований по фигурному катания, когда моя пара случайно перережет мне горло коньком.',
			' после того как мне подбросят в еду стекло, из-за того что они мне завидуют.',
			' у себя во сне, а потом проснусь и ничего не вспомню.',
			' в метро, когда поезд сойдет с рельс и нас всех размажет по туннелю.',
			' во время уроков в школе, потому что забуду принять жизненно необходимые лекарства.',
			' потому что когда я пытался с инициировать свою собственную смерть, я случайно застрелил себя.',
			' потому что наступит зомби-апокалипсис и я стану одним из первых зараженных.'
		];
		if (!this.state._________reason2) {
			let timeDate = await new Date(Date.now() + this.random(1 * 365 * 24 * 60 * 60 * 1000, 70 * 365 * 24 * 60 * 60 * 1000)).getTime();
			let data = this.state.data;
			if(this.state.sValues === undefined || data._________date2 == false) {
				let rId = this.random(0, reasons.length);
				await this.setState({reason: reasons[rId]});
				await this.setState({timeDate});
				if(bridge.supports('VKWebAppStorageSet')) {
					try{
						await bridge.sendPromise('VKWebAppStorageSet', {key: '_________date1', value: timeDate.toString()});
						await bridge.sendPromise('VKWebAppStorageSet', {key: '_________reason1', value: rId.toString()});
						console.log('data saved as standart');

						timeDate = await new Date(Date.now() + this.random(1 * 365 * 24 * 60 * 60 * 1000, 70 * 365 * 24 * 60 * 60 * 1000)).getTime();
						rId = this.random(0, reasons.length);
						await bridge.sendPromise('VKWebAppStorageSet', {key: '_________date2', value: timeDate.toString()});
						await bridge.sendPromise('VKWebAppStorageSet', {key: '_________reason2', value: rId.toString()});
						console.log('data saved as paralel');

						let sValues = await bridge.sendPromise('VKWebAppStorageGet', {keys: ['_________date1', '_________date2', '_________reason1', '_________reason2']});
						sValues = sValues.keys;
						let data = {};
						try{
							for(let value of sValues){
								data[value.key] = Number(value.value);
							}
						}catch (e) {
							console.error('e3', e)
						}
						this.setState({ data, sValues });
					}catch (e) {console.error('e2',e);}
				}
			}else{
				if (isParalel) {
					await this.setState({_________reason2: reasons[data._________reason2]});
					await this.setState({timeDate2: data._________date2});
				} else {
					await this.setState({reason: reasons[data._________reason1]});
					await this.setState({timeDate: data._________date1});
				}
			}
		}
		await this.setState({paralel: isParalel});
		return true;
	}
	decOfNum(number, titles){
		let decCache = [],
			decCases = [2, 0, 1, 1, 1, 2];
		if(!decCache[number]) decCache[number] = number % 100 > 4 && number % 100 < 20 ? 2 : decCases[Math.min(number % 10, 5)];
		return titles[decCache[number]];
	}

	updateTime() {
		setInterval(()=>{
			try{
				let timeMs = (this.state.paralel ? this.state.timeDate2 : this.state.timeDate) - Date.now();

				let years, days, hours, minutes, seconds;
				let yMs = 1000 * 60 * 60 * 24 * 365,
					dMs = yMs / 365,
					hMs = dMs / 24,
					minMs = hMs / 60,
					sMs = minMs / 60;

				years = Math.floor(timeMs / yMs); timeMs -= yMs;
				days = Math.floor(timeMs / dMs) % 365; timeMs -= dMs;
				hours = Math.floor(timeMs / hMs) % 24; timeMs -= hMs;
				minutes = Math.floor(timeMs / minMs) % 60; timeMs -= minMs;
				seconds = Math.floor(timeMs / sMs) % 60; timeMs -= sMs;

				let times = [ [ years, [ 'год', 'года', 'лет' ] ],
						[ days, ['день', 'дня', 'дней'] ],
						[ hours, ['час', 'часа', 'часов'] ],
						[ minutes, ['минута', 'минуты', 'минут'] ],
						[ seconds, ['секунда', 'секунды', 'секунд'] ]],

					timesText = [];

				for(let i = 0; i < times.length; i++){
					if (times[i][0] > 0) timesText.push(times[i][0] + ' ' + this.decOfNum(times[i][0], times[i][1]));
				}

				this.setState({ time: timesText.join(', ') });
			}catch (e) {
				console.error(e);
			}
		}, 500);
	}

	go(panel) {
		this.setState({activePanel: panel});
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	random(min, max) {
		return Math.floor(Math.random() * (max + 1 - min) + min);
	}

	async get(method, params) {
		try{
			if (params === undefined || params === null) params = {};
			let vkParams = JSON.parse('{"' + decodeURI(window.location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
			let str = [];
			params = {...params, ...vkParams};
			for (let p in params)
				if (params.hasOwnProperty(p)) {
					str.push(encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
				}
			params = str.join('&');
			let url = 'https://donomas.ru:8080/api/' + method + '?' + params;
			let response_ = new Promise((resolve, reject) => {
				request.get({url}, function (err, httpResponse, body) {
					resolve(body);
				});
			});
			let response = JSON.parse(await response_);
			console.log(response);
			return response;
		}catch (e) {
			return {};
		}
	}

	async share () {
		this.setState({ popout: <ScreenSpinner/>, screen: true });
		await this.sleep(250);
		let element = document.getElementsByClassName('View__panels')[0];
		html2canvas(element, { allowTaint: true }).then(async canvas => {
			let blob = canvas.toDataURL('image/png');
			try{
				let resp = await bridge.send('VKWebAppShowStoryBox', { background_type: 'image', blob, attachment: { url: 'https://vk.com/app' + app_id, text: 'go_to', type: 'url' } });
				let response = await this.get('stories.share', { app_id });
				this.setState({ shared: true });
			}catch (e) {}
			this.setState({ popout: null, screen: false });
		});
	}

	render() {
		return (
			<View activePanel={this.state.activePanel} popout={this.state.popout}>
				<Panel id='main' style={{ zIndex: 1 }}>
					<div style={{ zIndex: 3 }}>
						<div id='bg_shapes'/>
						<img crossOrigin='anonymous' src={bgText} style={{width: '80vw', position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
						<img crossOrigin='anonymous' src={bgDark} style={{height: '100vh'}}/>
						<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', textAlign: 'center', zIndex: 3 }}>
							<Title level='1' weight='semibold'>Мне осталось <span style={{ /*backgroundImage: 'linear-gradient(to left, #fc6076 0%, #ff9a44 100%)', padding: '4px 4px 8px 4px', lineHeight: '18px',*/ color: 'red', display: 'inline-block' }}>жить</span></Title>
							{ this.state.time ? <Title level='2' weight='semibold' style={{ marginTop: '12px', color: '#09ad8c' }}>{this.state.time}</Title> : <span style={{ marginTop: '12px' }}>0 секунд</span> }
							{
								this.state.shared || this.state.screen ?
									<Headline weight='semibold' style={{ marginTop: '12px', color: 'white', background: 'linear-gradient(to right, rgba(28, 185, 2, 0.15) 0%, rgba(255, 0, 0, 0.15) 100%)', padding: '4px', display: 'inline-block' }}>
										{ 'Я умру' + ( this.state.paralel ? this.state._________reason2: this.state.reason ) }
									</Headline>
									:
									<Button style={{ marginTop: '18px' }} size='xl' onClick={()=> {
										this.setState({
											popout:
												<Alert
													actions={[{
														title: 'Поделиться',
														autoclose: true,
														action: async () => {
															await this.share();
														},
													}]}
													onClose={() => this.setState({popout: null})}
												>
                                                <span className={'centered'} style={{textAlign: 'center', fontSize: '18px', lineHeight: '20px'}}>
                                                   Поделитесь результатом в истории, чтобы увидеть причину смерти
                                                </span>
												</Alert>
										});
									}}>Показать причину смерти</Button>
							}
							<br/>
							<Button before={<Icon24ImageFilterOutline width={20} height={20} style={{ paddingRight: '4px' }}/>} size='l' style={{ display: this.state.screen && 'none' }} onClick={
								async ()=>{
									if(this.state.shared === true){
										await this.generateRandomTime(!this.state.paralel);
									}else{
										this.setState({ snackbar:
												<Snackbar
													layout='vertical'
													onClose={() => this.setState({ snackbar: null })}
												>
													Необходимо сначала поделиться в истории
												</Snackbar>
										});
									}
								}}>{ this.state.paralel ? 'Вернуться' : 'Паралельная вселенная' }
							</Button>
							{
								this.state.screen &&
								<Title level={2} weight='semibold' style={{ position: 'absolute',top: '80%', left: '50%', transform: 'translate(-50%, 0%)', width: '80vw', textAlign: 'center', marginTop: '20vh', color: 'white' }}>
									Переходи в приложение, если не боишься узнать свою дату смерти
								</Title>
							}
						</div>
						<FixedLayout vertical='bottom' style={{ marginBottom: os === ANDROID ? '36px' : '12px', display: this.state.screen && 'none' }}>
							<Div>
								<Button onClick={async ()=>{
									this.share();
								}} before={<Icon28StoryOutline/>} size='xl' mode='commerce'>Поделиться в истории</Button>
							</Div>
						</FixedLayout>
						{this.state.snackbar}
					</div>
				</Panel>
				<Panel id='form'>
					<img crossOrigin='anonymous' src={bgDark} style={{height: '100vh', position: 'absolute'}}/>
					<FormLayout style={{zIndex: 3}}>
						<Input top='Сколько Вам лет?' type='number' defaultValue={18}/>
						<Select top='Какой Ваш пол?' defaultValue='m'>
							<option value='m'>Мужской</option>
							<option value='f'>Женский</option>
						</Select>
						<Select top='Кто Вы по знаку зодиака?' defaultValue='znak1'>
							<option value='znak1'>Овен</option>
							<option value='znak2'>Телец</option>
							<option value='znak3'>Близнецы</option>
							<option value='znak4'>Рак</option>
							<option value='znak5'>Лев</option>
							<option value='znak6'>Дева</option>
							<option value='znak7'>Весы</option>
							<option value='znak8'>Скорпион</option>
							<option value='znak9'>Змееносец</option>
							<option value='znak10'>Стрелец</option>
							<option value='znak11'>Козерог</option>
							<option value='znak12'>Водолей</option>
							<option value='znak13'>Рыбы</option>
						</Select>
						<Select top='Вы проживаете в России?' defaultValue='yy'>
							<option value='yy'>Да</option>
							<option value='nn'>Нет</option>
						</Select>
						<Select top='Вы бывали на похоронах?' defaultValue='nn'>
							<option value='yy'>Да</option>
							<option value='nn'>Нет</option>
						</Select>
						<Button size='xl' onClick={async ()=>{
							try{
								if(need_sub_msg) {
									let resp = await bridge.send('VKWebAppAllowMessagesFromGroup', {
										group_id: group_id,
										key: 'fsdgeruiogj'
									});
								}
								if(need_sub_group){
									let resp = await bridge.send('VKWebAppJoinGroup', {group_id, key: 'fsdgeruiogj'});
								}
								this.setState({ popout: <ScreenSpinner/> });
								await this.initializeTimer();
								this.setState({ popout: null });
								this.go('main');
							}catch (e) {
								this.setState({ snackbar:
										<Snackbar
											layout='vertical'
											onClose={() => this.setState({ snackbar: null })}
										>
											Необходимо {need_sub_msg ? 'разрешение на получение сообщений' : 'подписаться на группу'}
										</Snackbar>
								});
							}

						}}>Узнать дату смерти</Button>
					</FormLayout>
					{this.state.snackbar}
				</Panel>
			</View>
		);
	}
}

export default App;