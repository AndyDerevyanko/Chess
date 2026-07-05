/* ============================================================
   OFFLINE CHESS — sound effects
   Tiny synthesized retro blips via the Web Audio API. No audio
   files, so the site stays a plain offline folder. Presentation
   only - game code just calls playSound(name) and moves on.
   ============================================================ */

//created lazily on the first sound, which always follows a click or drop -
//browsers refuse AudioContexts that start before a user gesture
let soundCtx = null;

function soundContext(){
	if(typeof AudioContext == "undefined")
		return null;

	if(soundCtx == null)
		soundCtx = new AudioContext();

	//a context spun up too early sits suspended until poked from a gesture
	if(soundCtx.state == "suspended")
		soundCtx.resume();

	return soundCtx;
}

//one beep: frequency glides freq -> endFreq over dur seconds, with a fast
//attack and exponential decay so it doesn't click at either end
function soundBlip(ctx, at, dur, freq, endFreq, vol, shape){
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	const t = ctx.currentTime + at;

	osc.type = shape;
	osc.frequency.setValueAtTime(freq, t);
	osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

	gain.gain.setValueAtTime(0.0001, t);
	gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
	gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(t);
	osc.stop(t + dur + 0.02);
}

const SOUND_EFFECTS = {
	//low woody knock
	move: ctx => soundBlip(ctx, 0, .09, 240, 130, .3, "triangle"),

	//sharper snap, then the same knock underneath
	capture: ctx => {
		soundBlip(ctx, 0, .05, 440, 300, .25, "square");
		soundBlip(ctx, .04, .1, 200, 120, .35, "triangle");
	},

	//two rising alert notes
	check: ctx => {
		soundBlip(ctx, 0, .09, 520, 540, .2, "square");
		soundBlip(ctx, .1, .16, 780, 800, .2, "square");
	},

	//three falling notes, game over
	checkmate: ctx => {
		soundBlip(ctx, 0, .16, 660, 640, .22, "square");
		soundBlip(ctx, .17, .16, 494, 480, .22, "square");
		soundBlip(ctx, .34, .34, 330, 315, .25, "square");
	}
};

function playSound(name){
	try {
		const ctx = soundContext();
		if(ctx != null && SOUND_EFFECTS[name] != null)
			SOUND_EFFECTS[name](ctx);
	} catch(err){
		//sound is decoration - it must never break a move
	}
}
