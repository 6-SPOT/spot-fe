package com.spot.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        bridge.getWebView().setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
        bridge.getWebView().setVerticalScrollBarEnabled(false);
    }
}
