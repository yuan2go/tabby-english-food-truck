import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { Profile } from '../platform/profile';
export function Home({
  profile,
  onChoose,
  audio,
  legacy,
}: {
  profile: Profile;
  onChoose: (screen: 'story' | 'endless' | 'mini' | 'training' | 'settings') => void;
  audio: ForegroundAudio;
  legacy: boolean;
}) {
  const entry = (id: 'story' | 'endless' | 'mini' | 'training', name: string, sound: string) => (
    <div className={`yard-entry yard-${id}`}>
      <button
        type="button"
        className="entry-main"
        onClick={() => {
          void audio.unlock();
          onChoose(id);
        }}
      >
        <span>{name}</span>
        <small>
          {id === 'story'
            ? '接过钥匙，一起开店'
            : id === 'endless'
              ? '今天也有新朋友'
              : id === 'mini'
                ? '听一听 · 找一找 · 拼一拼'
                : '看小猫做，再亲手试试'}
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
        <span>TABBY'S LITTLE KITCHEN</span>
        <h1>狸花猫的英语餐车</h1>
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
      <img className="yard-cat" src={assetUrl('cat-greet')} alt="小主厨狸花猫" />
      {entry(
        'story',
        profile.completed.length || profile.prologue ? '继续故事' : '故事模式',
        'menu-story',
      )}
      {entry('endless', '无尽营业', 'menu-endless')}
      {entry('training', '教学练习', 'menu-training')}
      {entry('mini', '迷你游戏', 'menu-mini')}
      {profile.completed.length > 0 ? (
        <div className="yard-planter" role="img" aria-label="第一章的小花已经开了">
          {['left', 'middle', 'right'].map((place) => (
            <i key={place} className={`flower flower-${place}`}>
              <b />
            </i>
          ))}
        </div>
      ) : null}
      {profile.completed.length > 1 ? (
        <div className="yard-bunting" role="img" aria-label="第二章的小院彩旗">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      ) : null}
      {profile.completed.length > 2 ? (
        <div className="yard-picnic" role="img" aria-label="第三章的新野餐桌布" />
      ) : null}
      {profile.completed.length > 3 ? (
        <div className="yard-lights" role="img" aria-label="第四章的暖灯串">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      ) : null}
      {profile.completed.length > 4 ? (
        <div className="yard-photo" role="img" aria-label="社区小食会合影">
          <img src={assetUrl('guest-0-2')} alt="兔子朋友" />
          <img src={assetUrl('cat-celebrate')} alt="小主厨" />
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
