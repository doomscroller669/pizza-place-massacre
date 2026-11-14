package com.doomscroller.pizzaplacemassacre;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

/**
 * Full-screen WebView that runs the game bundled in assets/index.html.
 * Toni talks through the phone's own text-to-speech engine, exposed to the page as window.AndroidTTS,
 * because the Android WebView has no speechSynthesis of its own.
 */
public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(0xFF070504);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // saves live in localStorage
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());

        tts = new TextToSpeech(this, this);
        web.addJavascriptInterface(new TtsBridge(), "AndroidTTS");

        if (state == null) web.loadUrl("file:///android_asset/index.html");
        else web.restoreState(state);
        hideSystemBars();
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) return;
        tts.setLanguage(Locale.US);
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { js("window.__ttsEvent&&window.__ttsEvent('start','" + id + "')"); }
            @Override public void onDone(String id) { js("window.__ttsEvent&&window.__ttsEvent('done','" + id + "')"); }
            @Override public void onError(String id) { js("window.__ttsEvent&&window.__ttsEvent('done','" + id + "')"); }
        });
        ttsReady = true;
    }

    private void js(final String code) {
        web.post(() -> web.evaluateJavascript(code, null));
    }

    /** Called from the page. Volume 0..1, pan -1 (left) .. 1 (right), so the phone voice can come from where Toni is. */
    private class TtsBridge {
        @JavascriptInterface public boolean ready() { return ttsReady; }

        @JavascriptInterface
        public void speak(String text, String id, float volume, float pan, float rate, float pitch) {
            if (!ttsReady) return;
            Bundle p = new Bundle();
            p.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, Math.max(0f, Math.min(1f, volume)));
            p.putFloat(TextToSpeech.Engine.KEY_PARAM_PAN, Math.max(-1f, Math.min(1f, pan)));
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, p, id);
        }

        @JavascriptInterface public void stop() { if (ttsReady) tts.stop(); }
    }

    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    /** Leaving the app pauses the game (only if it's being played) and cuts Toni off mid-sentence. */
    @Override
    protected void onPause() {
        web.evaluateJavascript("(function(){var g=window.__ppm;if(g&&g.mode==='play')window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP'}));})();", null);
        if (ttsReady) tts.stop();
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        hideSystemBars();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        super.onDestroy();
    }

    /** The back button toggles the pause menu instead of closing the game. */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}));", null);
    }
}
