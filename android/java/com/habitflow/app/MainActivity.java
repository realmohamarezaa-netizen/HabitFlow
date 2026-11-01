package com.habitflow.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * HabitFlow — offline WebView shell.
 * Loads the bundled single-page app from assets/www and keeps
 * localStorage (DOM storage) so all habit data stays on device.
 */
public class MainActivity extends Activity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        // Security hardening: the app only ever loads file:///android_asset,
        // which is NOT affected by these flags — so we can safely deny
        // arbitrary file:// and content:// access from the web layer.
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        webView.setBackgroundColor(Color.BLACK);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setWebViewClient(new WebViewClient());

        setContentView(webView);
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        // Let the web app close sheets/modals first (window.__nativeBack),
        // otherwise fall back to default behaviour.
        webView.evaluateJavascript(
            "(window.__nativeBack ? window.__nativeBack() : 'false')",
            new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    if (!"\"true\"".equals(value)) {
                        moveTaskToBack(true);
                    }
                }
            });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
