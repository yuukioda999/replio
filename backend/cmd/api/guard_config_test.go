package main

import "testing"

func TestGuardFromEnv(t *testing.T) {
 for _,tc:=range []struct{name string;values map[string]string;bad bool}{
  {"default disabled",nil,false},
  {"enabled",map[string]string{"GENERATION_ENABLED":"true"},false},
  {"invalid quota",map[string]string{"GENERATION_MAX_REQUESTS_PER_HOUR":"0"},true},
  {"invalid concurrency",map[string]string{"GENERATION_MAX_CONCURRENT":"-1"},true},
  {"custom",map[string]string{"GENERATION_ENABLED":"true","GENERATION_MAX_REQUESTS_PER_HOUR":"5","GENERATION_MAX_CONCURRENT":"1"},false},
 } {t.Run(tc.name,func(t *testing.T){
  _,err:=guardFromEnv(func(k string)string{return tc.values[k]})
  if (err!=nil)!=tc.bad {t.Fatalf("err=%v wantBad=%v",err,tc.bad)}
 })}
}
