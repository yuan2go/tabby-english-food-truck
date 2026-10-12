import './home-entry.css';
import { ADVENTURES } from '../content/adventure';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { Profile } from '../platform/profile';
import { SceneIcon } from './SceneIcon';
export function Home({
  profile,
  onChoose,
  audio,
  legacy,
  onActivity,
  resumeChapter,
}: {
  profile: Profile;
  onChoose: (screen: 'story' | 'endless' | 'mini' | 'training' | 'settings') => void;
  audio: ForegroundAudio;
  legacy: boolean;
  onActivity: (chapter: number, explore?: boolean) => void;
  resumeChapter?: number;
}) {
  const completed = (chapter: number) =>
    profile.activityMemories.some(
      (m) => m.state.kind === 'chapter' && m.state.chapter === chapter && m.state.rewards.length,
    );
  const firstVisit = !profile.activityMemories.length;
  const next = resumeChapter ?? ADVENTURES.find((c) => !completed(c.id))?.id ?? 4;
  const entry = (id: 'story' | 'endless' | 'mini' | 'training', name: string, sound: string) => (
    <div className={`yard-entry yard-${id}`}>
      <button
        type="button"
        className="entry-main"
        aria-label={name}
        onClick={() => {
          void audio.unlock();
          if (id === 'story') onActivity(next);
          else onChoose(id);
        }}
      >
        <span>{name}</span>
        <small>
          {id === 'story'
            ? firstVisit
              ? '和大咪做第一份早餐'
              : ADVENTURES[next]?.goal
            : id === 'endless'
              ? '今天也有新朋友'
              : id === 'mini'
                ? '听一听 · 找一找 · 拼一拼'
                : '看大咪做，再亲手试试'}
        </small>
      </button>
      <button
        type="button"
        className="entry-sound"
        aria-label={`听${name}`}
        onClick={() => void audio.play(sound)}
      >
        ♫
      </button>
    </div>
  );
  return (
    <section
      className={`courtyard growth-${profile.completed.length}`}
      aria-label="餐车小院"
      style={{ backgroundImage: `url(${assetUrl('courtyard')})` }}
    >
      <header className="yard-title">
        <span>DAMI'S LITTLE KITCHEN</span>
        <h1>大咪的英语餐车</h1>
        <p>一辆小餐车，一院好朋友。</p>
      </header>
      <button
        type="button"
        className="yard-settings"
        aria-label="设置"
        onClick={() => onChoose('settings')}
      >
        ⚙
      </button>
      <img className="yard-cat" src={assetUrl('cat-greet')} alt="小主厨大咪" />
      {entry('story', `正在准备 · ${ADVENTURES[next]?.title}`, 'menu-story')}
      <nav className="yard-other-activities" aria-label="自己选其他玩法">
        {entry('endless', '自由开店', 'menu-endless')}
        <button type="button" className="yard-activity-badge" onClick={() => onChoose('story')}>
          <SceneIcon kind="recipe" />
          旧食谱 · 回访活动与作品
        </button>
        {entry('training', '教学练习', 'menu-training')}
        {entry('mini', '迷你游戏', 'menu-mini')}
      </nav>
      {completed(0) ? (
        <button
          type="button"
          className="yard-planter"
          aria-label="照顾迎客花"
          onClick={() => onActivity(0, true)}
        >
          {['left', 'middle', 'right'].map((place) => (
            <i key={place} className={`flower flower-${place}`}>
              <b />
            </i>
          ))}
        </button>
      ) : null}
      {completed(1) ? (
        <button
          type="button"
          className="yard-bunting"
          aria-label="换分享彩旗"
          onClick={() => onActivity(1, true)}
        >
          <i />
          <i />
          <i />
          <i />
          <i />
        </button>
      ) : null}
      {completed(2) ? (
        <button
          type="button"
          className="yard-picnic"
          aria-label="回到野餐桌"
          onClick={() => onActivity(2, true)}
        />
      ) : null}
      {completed(3) ? (
        <button
          type="button"
          className="yard-lights"
          aria-label="点亮晚餐灯"
          onClick={() => onActivity(3, true)}
        >
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </button>
      ) : null}
      {completed(4) ? (
        <div className="yard-photo" role="img" aria-label="社区小食会合影">
          <img src={assetUrl('guest-0-2')} alt="兔子朋友" />
          <img src={assetUrl('cat-celebrate')} alt="小主厨大咪" />
          <img src={assetUrl('guest-1-2')} alt="刺猬朋友" />
          <span>Thank you!</span>
        </div>
      ) : null}
      <small className="development-note">开发素材与语音待审核</small>
      {legacy ? (
        <aside className="legacy-note">
          M1 进度已保留。这是新的 M2 故事；原存档可在设置中导出。
        </aside>
      ) : null}
    </section>
  );
}
