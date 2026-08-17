import Logo from '@/components/Logo';

import c from './PhoneTelegramMock.module.css';

type Props = {
  botName?: string;
  /** Tasdiqlangan to'lov summasi */
  amount?: string;
};

/**
 * iPhone 17 Pro Max ramkasi ichida Telegram chat mockup.
 * Faqat vizual bezak — client JS talab qilmaydi.
 */
export default function PhoneTelegramMock({
  botName = 'OpenBudget Bot',
  amount = '35 000',
}: Props) {
  return (
    <div className={c.wrap} aria-hidden>
      <div className={c.phone}>
        <div className={c.btnSide} />
        <div className={c.frame}>
          <div className={c.island} />
          <div className={c.status}>
            <span className={c.time}>9:41</span>
            <span className={c.statusIco}>
              <svg viewBox="0 0 18 12" width="17" height="11" aria-hidden>
                <path
                  fill="currentColor"
                  d="M1 8.5h2v3H1zm4-3h2v6H5zm4-2h2v8H9zm4-1h2v9h-2z"
                />
              </svg>
              <svg viewBox="0 0 16 12" width="15" height="11" aria-hidden>
                <path
                  fill="currentColor"
                  d="M8 2.4c1.9 0 3.6.8 4.8 2.1l1.4-1.4C12.4 1.4 10.3.5 8 .5 4.9.5 2.2 2.4 1 5.1l1.6 1.2C3.5 4.2 5.5 2.4 8 2.4zm0 3c1.1 0 2.1.5 2.8 1.2l1.4-1.4C11 4.6 9.6 4 8 4c-2 0-3.8 1-4.8 2.6l1.6 1.2c.7-.9 1.8-1.4 3.2-1.4zm0 3c.6 0 1.1.2 1.5.6L12 7.4C10.9 6.5 9.5 6 8 6c-1.5 0-2.9.5-4 1.4l2.5 2c.4-.4.9-.6 1.5-.6z"
                />
              </svg>
              <svg viewBox="0 0 28 13" width="24" height="11" aria-hidden>
                <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" fill="none" />
                <rect x="2.5" y="2.5" width="17" height="8" rx="1.5" fill="currentColor" />
                <path fill="currentColor" d="M24 4.5h2.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H24z" />
              </svg>
            </span>
          </div>

          <div className={c.screen}>
            <header className={c.tgHead}>
              <span className={c.back} aria-hidden>
                ‹
              </span>
              <span className={c.tgAv}>
                <Logo size={18} className={c.tgAvImg} />
              </span>
              <div className={c.tgMeta}>
                <b>{botName}</b>
                <span>bot</span>
              </div>
            </header>

            <div className={c.chat}>
              <p className={c.day}>Bugun</p>

              <div className={`${c.msg} ${c.msgBot}`}>
                <p>Assalomu alaykum! Ovoz berish va to'lov olish uchun /start bosing.</p>
                <time>09:38</time>
              </div>

              <div className={`${c.msg} ${c.msgUser}`}>
                <p>/start</p>
                <time>09:39</time>
              </div>

              <div className={`${c.msg} ${c.msgBot}`}>
                <p>Tayyor! Quyidagi tugmani bosing va ovoz bering.</p>
                <time>09:39</time>
              </div>

              <div className={c.keyboard}>
                <span>Ovoz berish</span>
              </div>

              <div className={`${c.msg} ${c.msgUser}`}>
                <p>Ovoz berish</p>
                <time>09:40</time>
              </div>

              <div className={`${c.msg} ${c.msgBot} ${c.msgPay}`}>
                <p className={c.payOk}>✓ To'lov kartangizga yuborildi.</p>
                <p className={c.paySum}>
                  <span className="tnum">+{amount}</span> so'm
                </p>
                <time>09:41</time>
              </div>
            </div>

            <div className={c.inputBar}>
              <span className={c.attach} aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path
                    d="M14 6l-6.2 6.2a3 3 0 1 0 4.24 4.24L18.5 9.8a4.5 4.5 0 0 0-6.36-6.36L5.5 10.1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className={c.inputFake}>Xabar</span>
              <span className={c.mic} aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
