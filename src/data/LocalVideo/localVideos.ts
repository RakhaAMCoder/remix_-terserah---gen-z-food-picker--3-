import vid1 from './vid1.mp4';
import vid2 from './vid2.mp4';
import vid3 from './vid3.mp4';
import vid4 from './vid4.mp4';
import vid5 from './vid5.mp4';
import vid6 from './vid6.mp4';
import vid7 from './vid7.mp4';
import vid8 from './vid8.mp4';
import vid9 from './vid9.mp4';
import vid10 from './vid10.mp4';
import vid11 from './vid11.mp4';
import vid12 from './vid12.mp4';
import vid13 from './vid13.mp4';
import vid14 from './vid14.mp4';
import vid15 from './vid15.mp4';
import vid16 from './vid16.mp4';
import vid17 from './vid17.mp4';
import vid18 from './vid18.mp4';
import vid19 from './vid19.mp4';
import vid20 from './vid20.mp4';
import vid21 from './vid21.mp4';
import vid22 from './vid22.mp4';
import vid23 from './vid23.mp4';
import vid24 from './vid24.mp4';
import vid25 from './vid25.mp4';
import vid26 from './vid26.mp4';
import vid27 from './vid27.mp4';
import vid28 from './vid28.mp4';
import vid29 from './vid29.mp4';
import vid30 from './vid30.mp4';
import vid31 from './vid31.mp4';
import vid32 from './vid32.mp4';
import vid33 from './vid33.mp4';

const videoFiles = [
  vid1, vid2, vid3, vid4, vid5, vid6, vid7, vid8, vid9, vid10, vid11,
  vid12, vid13, vid14, vid15, vid16, vid17, vid18, vid19, vid20, vid21,
  vid22, vid23, vid24, vid25, vid26, vid27, vid28, vid29, vid30, vid31,
  vid32, vid33,
];

const tiktokUrls = [
  'https://www.tiktok.com/@tumbasmalang/video/7458910916436872466',
  'https://www.tiktok.com/@vilmeijuga/video/7597410582148500756',
  'https://www.tiktok.com/@eldwm/video/7616938015281220885',
  'https://www.tiktok.com/@alikhemal_/video/7598813055597759764',
  'https://www.tiktok.com/@udamakanbelom_/video/7617445737886010644',
  'https://www.tiktok.com/@katalogmalang/video/7362572022523759878',
  'https://www.tiktok.com/@mamang_ndut/video/7591782995405655317',
  'https://www.tiktok.com/@nanakoot/video/7508230245888068870',
  'https://www.tiktok.com/@minggahnd/video/7585182424184048917',
  'https://www.tiktok.com/@wawan_rde/video/7552105347180203275',
  'https://www.tiktok.com/@ceritakulineranasik/video/7601156633741233415',
  'https://www.tiktok.com/@ku_sukasuka.id/video/7534612764635991304',
  'https://www.tiktok.com/@tenten_aja/video/7581698047139187976',
  'https://www.tiktok.com/@quhiiin/video/7610304027531791636',
  'https://www.tiktok.com/@nakammalang/video/7565853386180988178',
  'https://www.tiktok.com/@akugakgendutloh/video/7555127486930193720',
  'https://www.tiktok.com/@dolanyok.malang/video/7554987449911348491',
  'https://www.tiktok.com/@quhiiin/video/7603639954593434900',
  'https://www.tiktok.com/@tenten_aja/video/7609234320259337490',
  'https://www.tiktok.com/@inginkurrus15/video/7521592153643044102',
  'https://www.tiktok.com/@officialdikichi.id/video/7480771572609862930',
  'https://www.tiktok.com/@kuliner.neng.solo/video/7565433770736700690',
  'https://www.tiktok.com/@nelysyahidaae/video/7591704999944523016',
  'https://www.tiktok.com/@adityaaimam/video/7592172636159954197',
  'https://www.tiktok.com/@opsikuliner/video/7568451007978556680',
  'https://www.tiktok.com/@cowokopian/video/7591858881303825685',
  'https://www.tiktok.com/@romo_kulineran/video/7559102266817498379',
  'https://www.tiktok.com/@nakammalang/video/7630325921702186260',
  'https://www.tiktok.com/@alikhemal_/video/7573597955437890837',
  'https://www.tiktok.com/@dolanyok.malang/video/7601710877888236808',
  'https://www.tiktok.com/@panggilsajajindul/video/7626680053383859477',
  'https://www.tiktok.com/@friday.mlg/video/7625491603792186642',
  'https://www.tiktok.com/@nakammalang/video/7539163927289122053',
];

export const localVideos = videoFiles.map((videoUrl, index) => ({
  id: `local-${index + 1}`,
  fileName: `vid${index + 1}.mp4`,
  url: videoUrl,
  tiktokUrl: tiktokUrls[index],
  uploaderName: 'Kuliner Feed',
  uploaderId: 'offline-system-profile',
  uploaderAvatar: '',
  createdAt: new Date().toISOString(),
}));